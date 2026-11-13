from animais.models import Animal
from core.testes import ApiTestCase
from usuarios.models import Usuario

from .models import SolicitacaoAdocao


class SolicitacaoApiTests(ApiTestCase):
    def setUp(self):
        self.ong = self.criar_usuario("ong@x.com", Usuario.Tipo.RESPONSAVEL, nome="ONG Patas", telefone="(17) 3421-0000")
        self.outra_ong = self.criar_usuario("outra@x.com", Usuario.Tipo.RESPONSAVEL)
        self.ana = self.criar_usuario("ana@x.com", nome="Ana", telefone="(17) 99999-0000")
        self.bia = self.criar_usuario("bia@x.com", nome="Bia")
        self.rex = Animal.objects.create(
            nome="Rex", cidade="Votuporanga", uf="SP", especie="cachorro", sexo="macho", idade=2,
            porte="medio", foto="animais/rex.jpg", responsavel=self.ong,
        )

    def pedir(self, usuario, animal=None):
        self.entrar(usuario)
        return self.client.post("/api/solicitacoes/", {"animal": str((animal or self.rex).id)}, format="json")

    def test_adotante_pede_e_acompanha_sem_ver_contato_antes_de_aceita(self):
        resposta = self.pedir(self.ana)
        self.assertEqual(resposta.status_code, 201, resposta.data)
        self.assertEqual(resposta.data["status"], "pendente")
        minhas = self.client.get("/api/solicitacoes/").data
        self.assertEqual(minhas[0]["animal_dados"]["nome"], "Rex")
        self.assertEqual(minhas[0]["responsavel"], {"nome": "ONG Patas"})

    def test_pedido_repetido_animal_adotado_e_tipo_errado(self):
        self.pedir(self.ana)
        self.assertEqual(self.pedir(self.ana).data["animal"], ["Este adotante já tem uma solicitação para este animal."])
        self.rex.status = Animal.Status.ADOTADO
        self.rex.save()
        self.assertEqual(
            self.pedir(self.bia).data["animal"], ["Não foi possível enviar: este animal acabou de ser adotado."]
        )
        self.assertEqual(self.pedir(self.ong).status_code, 403)
        self.sair()
        self.assertEqual(self.client.post("/api/solicitacoes/", {"animal": str(self.rex.id)}).status_code, 401)

    def test_responsavel_ve_interessados_com_pendentes_primeiro(self):
        recusada = SolicitacaoAdocao.objects.create(adotante=self.bia, animal=self.rex, status="recusada")
        pendente = SolicitacaoAdocao.objects.create(adotante=self.ana, animal=self.rex)
        self.entrar(self.ong)
        lista = self.client.get(f"/api/meus-animais/{self.rex.id}/solicitacoes/").data
        self.assertEqual([s["id"] for s in lista], [str(pendente.id), str(recusada.id)])
        self.assertEqual(lista[0]["adotante"], {"nome": "Ana"})
        self.assertEqual(len(self.client.get(f"/api/meus-animais/{self.rex.id}/solicitacoes/?status=pendente").data), 1)
        self.entrar(self.outra_ong)
        self.assertEqual(self.client.get(f"/api/meus-animais/{self.rex.id}/solicitacoes/").status_code, 404)

    def test_aceitar_mostra_contato_dos_dois_lados(self):
        solicitacao = SolicitacaoAdocao.objects.create(adotante=self.ana, animal=self.rex)
        self.entrar(self.ong)
        resposta = self.client.patch(f"/api/solicitacoes/{solicitacao.id}/", {"status": "aceita"}, format="json")
        self.assertEqual(resposta.status_code, 200, resposta.data)
        self.assertEqual(resposta.data["adotante"], {"nome": "Ana", "email": "ana@x.com", "telefone": "(17) 99999-0000"})
        self.entrar(self.ana)
        responsavel = self.client.get("/api/solicitacoes/").data[0]["responsavel"]
        self.assertEqual(responsavel, {"nome": "ONG Patas", "email": "ong@x.com", "telefone": "(17) 3421-0000"})

    def test_so_uma_aceita_por_animal_e_desfazer_recusa(self):
        primeira = SolicitacaoAdocao.objects.create(adotante=self.ana, animal=self.rex)
        segunda = SolicitacaoAdocao.objects.create(adotante=self.bia, animal=self.rex)
        self.entrar(self.ong)
        self.client.patch(f"/api/solicitacoes/{primeira.id}/", {"status": "aceita"}, format="json")
        resposta = self.client.patch(f"/api/solicitacoes/{segunda.id}/", {"status": "aceita"}, format="json")
        self.assertEqual(resposta.data["status"], ["Este animal já tem uma solicitação aceita."])
        self.assertEqual(self.client.patch(f"/api/solicitacoes/{segunda.id}/", {"status": "recusada"}).status_code, 200)
        self.assertEqual(self.client.patch(f"/api/solicitacoes/{segunda.id}/", {"status": "pendente"}).status_code, 200)

    def test_responsavel_de_outro_animal_e_adotante_nao_respondem(self):
        solicitacao = SolicitacaoAdocao.objects.create(adotante=self.ana, animal=self.rex)
        self.entrar(self.outra_ong)
        self.assertEqual(self.client.patch(f"/api/solicitacoes/{solicitacao.id}/", {"status": "aceita"}).status_code, 404)
        self.entrar(self.ana)
        self.assertEqual(self.client.patch(f"/api/solicitacoes/{solicitacao.id}/", {"status": "aceita"}).status_code, 403)

    def test_contagem_de_pendentes_no_perfil(self):
        SolicitacaoAdocao.objects.create(adotante=self.ana, animal=self.rex)
        SolicitacaoAdocao.objects.create(adotante=self.bia, animal=self.rex, status="recusada")
        self.entrar(self.ong)
        self.assertEqual(self.client.get("/api/auth/me/").data["pendentes"], 1)
        self.entrar(self.ana)
        self.assertEqual(self.client.get("/api/auth/me/").data["pendentes"], 0)
