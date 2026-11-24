from unittest import mock

from django.core.cache import cache
from rest_framework.throttling import ScopedRateThrottle

from core.testes import SENHA, ApiTestCase


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


class LimiteDeTentativasTests(ApiTestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)

    def test_login_bloqueia_depois_do_limite_por_endereco(self):
        self.criar_usuario("ana@x.com")
        limites = {**ScopedRateThrottle.THROTTLE_RATES, "login": "3/min"}
        with mock.patch.object(ScopedRateThrottle, "THROTTLE_RATES", limites):
            for _ in range(3):
                self.client.post("/api/auth/login/", {"email": "ana@x.com", "senha": "errada"}, format="json")
            bloqueado = self.client.post("/api/auth/login/", {"email": "ana@x.com", "senha": SENHA}, format="json")
            outro_endereco = self.client.post(
                "/api/auth/login/", {"email": "ana@x.com", "senha": SENHA}, format="json", REMOTE_ADDR="10.0.0.9"
            )
        self.assertEqual(bloqueado.status_code, 429)
        self.assertIn("Muitas tentativas", bloqueado.data["detail"])
        self.assertEqual(outro_endereco.status_code, 200)

    def test_rotas_de_conta_tem_limite(self):
        from usuarios.views import CadastroView, LoginView, RenovarTokenView

        self.assertEqual(
            [view.throttle_scope for view in (LoginView, CadastroView, RenovarTokenView)],
            ["login", "cadastro", "renovar"],
        )
        for escopo in ("login", "cadastro", "renovar"):
            self.assertIn(escopo, ScopedRateThrottle.THROTTLE_RATES)
