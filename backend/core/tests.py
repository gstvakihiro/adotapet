from django.test import TestCase
from django.urls import reverse


class HealthTests(TestCase):
    def test_health_responde_ok_com_banco(self):
        resposta = self.client.get(reverse("health"))
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json()["banco"], "ok")
