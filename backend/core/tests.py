from django.test import TestCase
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario

from .permissoes import EhAdotante, EhResponsavel


class HealthTests(TestCase):
    def test_health_responde_ok_com_banco(self):
        resposta = self.client.get(reverse("health"))
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json()["banco"], "ok")


class SoAdotante(APIView):
    permission_classes = [EhAdotante]

    def get(self, request):
        return Response({"ok": True})


class SoResponsavel(APIView):
    permission_classes = [EhResponsavel]

    def get(self, request):
        return Response({"ok": True})


class PermissoesPorTipoTests(TestCase):
    def setUp(self):
        self.fabrica = APIRequestFactory()
        self.adotante = Usuario.objects.create_user(email="ana@exemplo.com", password="senha-forte-123", nome="Ana")
        self.responsavel = Usuario.objects.create_user(
            email="ong@exemplo.com", password="senha-forte-123", nome="ONG", tipo=Usuario.Tipo.RESPONSAVEL
        )

    def chamar(self, view, usuario=None):
        cabecalho = {}
        if usuario:
            cabecalho["HTTP_AUTHORIZATION"] = f"Bearer {RefreshToken.for_user(usuario).access_token}"
        return view.as_view()(self.fabrica.get("/", **cabecalho))

    def test_adotante(self):
        self.assertEqual(self.chamar(SoAdotante, self.adotante).status_code, 200)
        resposta = self.chamar(SoResponsavel, self.adotante)
        self.assertEqual(resposta.status_code, 403)
        self.assertEqual(resposta.data["detail"], "Apenas responsáveis podem fazer esta ação.")

    def test_responsavel(self):
        self.assertEqual(self.chamar(SoResponsavel, self.responsavel).status_code, 200)
        resposta = self.chamar(SoAdotante, self.responsavel)
        self.assertEqual(resposta.status_code, 403)
        self.assertEqual(resposta.data["detail"], "Apenas adotantes podem fazer esta ação.")

    def test_visitante_sem_login_recebe_401(self):
        self.assertEqual(self.chamar(SoAdotante).status_code, 401)
        self.assertEqual(self.chamar(SoResponsavel).status_code, 401)
