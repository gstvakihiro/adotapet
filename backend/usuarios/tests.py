from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario


def cabecalho_com_token(usuario):
    return {"HTTP_AUTHORIZATION": f"Bearer {RefreshToken.for_user(usuario).access_token}"}


class MeTests(APITestCase):
    def setUp(self):
        self.url = reverse("me")
        self.usuario = Usuario.objects.create_user(
            email="ana@exemplo.com", password="senha-forte-123", nome="Ana", telefone="(17) 99999-0000"
        )

    def test_devolve_o_usuario_logado(self):
        resposta = self.client.get(self.url, **cabecalho_com_token(self.usuario))
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(
            resposta.json(),
            {
                "id": str(self.usuario.id),
                "email": "ana@exemplo.com",
                "nome": "Ana",
                "telefone": "(17) 99999-0000",
                "tipo": "adotante",
                "pendentes": 0,
            },
        )

    def test_token_do_cadastro_funciona_no_me(self):
        cadastro = self.client.post(
            reverse("cadastro"),
            {"email": "bia@exemplo.com", "nome": "Bia", "tipo": "responsavel", "senha": "uma-senha-forte-123"},
            format="json",
        )
        self.assertEqual(cadastro.status_code, 201)
        resposta = self.client.get(self.url, HTTP_AUTHORIZATION=f"Bearer {cadastro.json()['access']}")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json()["email"], "bia@exemplo.com")
        self.assertEqual(resposta.json()["tipo"], "responsavel")

    def test_token_do_login_funciona_no_me(self):
        login = self.client.post(
            reverse("login"), {"email": "ana@exemplo.com", "senha": "senha-forte-123"}, format="json"
        )
        self.assertEqual(login.status_code, 200)
        resposta = self.client.get(self.url, HTTP_AUTHORIZATION=f"Bearer {login.json()['access']}")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json()["email"], "ana@exemplo.com")

    def test_token_refresh_no_lugar_do_access_responde_401(self):
        login = self.client.post(
            reverse("login"), {"email": "ana@exemplo.com", "senha": "senha-forte-123"}, format="json"
        )
        resposta = self.client.get(self.url, HTTP_AUTHORIZATION=f"Bearer {login.json()['refresh']}")
        self.assertEqual(resposta.status_code, 401)

    def test_sem_token_responde_401(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_token_invalido_responde_401(self):
        resposta = self.client.get(self.url, HTTP_AUTHORIZATION="Bearer token-que-nao-existe")
        self.assertEqual(resposta.status_code, 401)

    def test_usuario_desativado_responde_401(self):
        cabecalho = cabecalho_com_token(self.usuario)
        self.usuario.is_active = False
        self.usuario.save()
        self.assertEqual(self.client.get(self.url, **cabecalho).status_code, 401)

    def test_aceita_get_e_patch_mas_nao_put(self):
        resposta = self.client.put(self.url, {"nome": "Outra"}, **cabecalho_com_token(self.usuario))
        self.assertEqual(resposta.status_code, 405)
