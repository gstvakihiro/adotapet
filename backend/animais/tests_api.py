from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from core.testes import ApiTestCase, imagem
from usuarios.models import Usuario

from .models import Animal


class AnimalApiTests(ApiTestCase):
    def setUp(self):
        self.ong = self.criar_usuario("ong@x.com", Usuario.Tipo.RESPONSAVEL, nome="ONG Patas")
        self.outra_ong = self.criar_usuario("outra@x.com", Usuario.Tipo.RESPONSAVEL)
        self.ana = self.criar_usuario("ana@x.com")

    def criar_animal(self, **campos):
        dados = dict(
            nome="Rex", cidade="Votuporanga", uf="SP", especie="cachorro", sexo="macho", idade=2,
            porte="medio", foto="animais/rex.jpg", responsavel=self.ong,
        )
        dados.update(campos)
        return Animal.objects.create(**dados)

    def dados_formulario(self, **campos):
        dados = dict(
            nome="Bolinha", especie="gato", sexo="femea", idade="0", porte="pequeno",
            cidade="Votuporanga", uf="SP", descricao="Muito dócil.", foto=imagem(),
        )
        dados.update(campos)
        return dados

    def test_lista_publica_mostra_so_disponiveis(self):
        self.criar_animal(nome="Disponivel")
        self.criar_animal(nome="Adotado", status=Animal.Status.ADOTADO)
        resposta = self.client.get("/api/animais/")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual([a["nome"] for a in resposta.data["results"]], ["Disponivel"])
        self.assertEqual(resposta.data["results"][0]["responsavel_nome"], "ONG Patas")
        self.assertNotIn("email", str(resposta.data))

    def test_filtros_combinam_grupos_e_aceitam_varias_opcoes(self):
        self.criar_animal(nome="Filhote gato", especie="gato", idade=0, porte="pequeno")
        self.criar_animal(nome="Jovem cao", especie="cachorro", idade=3, porte="medio")
        self.criar_animal(nome="Adulto cao", especie="cachorro", idade=5, porte="grande")
        self.criar_animal(nome="Idoso gato", especie="gato", idade=12, porte="pequeno", cidade="Fernandópolis")

        def nomes(consulta):
            return sorted(a["nome"] for a in self.client.get(f"/api/animais/?{consulta}").data["results"])

        self.assertEqual(nomes("especie=gato"), ["Filhote gato", "Idoso gato"])
        self.assertEqual(nomes("idade=filhote,idoso"), ["Filhote gato", "Idoso gato"])
        self.assertEqual(nomes("idade=jovem"), ["Jovem cao"])
        self.assertEqual(nomes("idade=adulto"), ["Adulto cao"])
        self.assertEqual(nomes("especie=cachorro&porte=grande"), ["Adulto cao"])
        self.assertEqual(nomes("cidade=fernandópolis&uf=sp"), ["Idoso gato"])
        self.assertEqual(nomes("especie=passaro"), [])

    def test_cidades_sem_repeticao_de_caixa(self):
        self.criar_animal(cidade="Votuporanga")
        self.criar_animal(cidade="votuporanga")
        self.criar_animal(cidade="Fernandópolis")
        self.criar_animal(cidade="Escondida", status=Animal.Status.ADOTADO)
        resposta = self.client.get("/api/animais/cidades/")
        self.assertEqual([c["cidade"].lower() for c in resposta.data], ["fernandópolis", "votuporanga"])

    def test_detalhe_mostra_animal_adotado_e_minha_solicitacao(self):
        animal = self.criar_animal(status=Animal.Status.ADOTADO)
        self.assertEqual(self.client.get(f"/api/animais/{animal.id}/").data["status"], "adotado")
        self.assertIsNone(self.client.get(f"/api/animais/{animal.id}/").data["minha_solicitacao"])
        animal.solicitacoes.create(adotante=self.ana)
        self.entrar(self.ana)
        self.assertEqual(self.client.get(f"/api/animais/{animal.id}/").data["minha_solicitacao"]["status"], "pendente")

    def test_responsavel_cadastra_animal_com_foto(self):
        self.entrar(self.ong)
        resposta = self.client.post("/api/meus-animais/", self.dados_formulario(status="adotado"), format="multipart")
        self.assertEqual(resposta.status_code, 201, resposta.data)
        animal = Animal.objects.get(id=resposta.data["id"])
        self.assertEqual(animal.responsavel, self.ong)
        self.assertEqual(animal.status, Animal.Status.DISPONIVEL)
        self.assertTrue(animal.foto.name.startswith("animais/"))

    def test_foto_grande_e_girada_e_reduzida(self):
        self.entrar(self.ong)
        foto = imagem("deitada.jpg", tamanho=(3000, 2000), exif_orientacao=6)
        resposta = self.client.post("/api/meus-animais/", self.dados_formulario(foto=foto), format="multipart")
        self.assertEqual(resposta.status_code, 201, resposta.data)
        with Image.open(Animal.objects.get(id=resposta.data["id"]).foto.path) as salva:
            self.assertEqual(salva.size, (1067, 1600))

    def test_erros_do_formulario_com_as_mensagens_das_telas(self):
        self.entrar(self.ong)
        resposta = self.client.post("/api/meus-animais/", {"idade": "abc"}, format="multipart")
        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(resposta.data["nome"], ["Informe o nome do animal."])
        self.assertEqual(resposta.data["especie"], ["Escolha a espécie."])
        self.assertEqual(resposta.data["cidade"], ["Informe a cidade."])
        self.assertEqual(resposta.data["foto"], ["Escolha uma foto do animal."])
        self.assertIn("Use 0 para menos de 1 ano", resposta.data["idade"][0])

    def test_idade_maxima_e_formatos_de_foto(self):
        self.entrar(self.ong)
        url = "/api/meus-animais/"
        self.assertIn("idade", self.client.post(url, self.dados_formulario(idade="31"), format="multipart").data)
        gif = self.client.post(url, self.dados_formulario(foto=imagem("gif.gif", "GIF")), format="multipart")
        self.assertEqual(gif.data["foto"], ["Este formato não é aceito. Envie a foto em JPG, PNG ou WebP."])
        falsa = SimpleUploadedFile("falsa.jpg", b"isto nao e uma imagem", content_type="image/jpeg")
        texto = self.client.post(url, self.dados_formulario(foto=falsa), format="multipart")
        self.assertEqual(texto.data["foto"], ["Não conseguimos abrir este arquivo como imagem. Tente outra foto."])
        webp = self.client.post(url, self.dados_formulario(foto=imagem("w.webp", "WEBP")), format="multipart")
        self.assertEqual(webp.status_code, 201, webp.data)

    def test_permissoes_de_meus_animais(self):
        animal = self.criar_animal()
        self.assertEqual(self.client.get("/api/meus-animais/").status_code, 401)
        self.entrar(self.ana)
        self.assertEqual(self.client.get("/api/meus-animais/").status_code, 403)
        self.entrar(self.outra_ong)
        self.assertEqual(self.client.get("/api/meus-animais/").data, [])
        self.assertEqual(self.client.patch(f"/api/meus-animais/{animal.id}/", {"status": "adotado"}).status_code, 404)

    def test_responsavel_troca_status_e_edita_sem_reenviar_foto(self):
        animal = self.criar_animal()
        animal.solicitacoes.create(adotante=self.ana)
        self.entrar(self.ong)
        lista = self.client.get("/api/meus-animais/").data
        self.assertEqual(lista[0]["pendentes"], 1)
        resposta = self.client.patch(f"/api/meus-animais/{animal.id}/", {"status": "adotado", "nome": "Rex II"})
        self.assertEqual(resposta.status_code, 200, resposta.data)
        animal.refresh_from_db()
        self.assertEqual((animal.status, animal.nome, animal.foto.name), ("adotado", "Rex II", "animais/rex.jpg"))
        self.assertEqual(len(self.client.get("/api/meus-animais/?status=disponivel").data), 0)

