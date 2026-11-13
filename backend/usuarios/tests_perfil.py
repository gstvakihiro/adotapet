from core.testes import ApiTestCase


class PerfilTests(ApiTestCase):
    def setUp(self):
        self.ana = self.criar_usuario("ana@x.com", nome="Ana")
        self.entrar(self.ana)

    def test_edita_nome_e_telefone(self):
        resposta = self.client.patch("/api/auth/me/", {"nome": "  Ana   Lima ", "telefone": "(17) 99999-0000"}, format="json")
        self.assertEqual(resposta.status_code, 200, resposta.data)
        self.ana.refresh_from_db()
        self.assertEqual((self.ana.nome, self.ana.telefone), ("Ana Lima", "(17) 99999-0000"))

    def test_nao_muda_email_nem_tipo(self):
        self.client.patch("/api/auth/me/", {"email": "outro@x.com", "tipo": "responsavel"}, format="json")
        self.ana.refresh_from_db()
        self.assertEqual((self.ana.email, self.ana.tipo), ("ana@x.com", "adotante"))

    def test_valida_nome_e_telefone(self):
        resposta = self.client.patch("/api/auth/me/", {"nome": "", "telefone": "liga pra mim"}, format="json")
        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(resposta.data["nome"], ["Informe o seu nome."])
        self.assertIn("telefone", resposta.data)

    def test_put_nao_e_permitido(self):
        self.assertEqual(self.client.put("/api/auth/me/", {"nome": "X"}, format="json").status_code, 405)
