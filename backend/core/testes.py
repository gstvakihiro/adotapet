import shutil
import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from usuarios.models import Usuario

SENHA = "Cachorro-feliz-2026"


def imagem(nome="foto.jpg", formato="JPEG", tamanho=(40, 30), exif_orientacao=None):
    buffer = BytesIO()
    figura = Image.new("RGB", tamanho, "orange")
    opcoes = {}
    if exif_orientacao:
        exif = Image.Exif()
        exif[0x0112] = exif_orientacao
        opcoes["exif"] = exif
    figura.save(buffer, formato, **opcoes)
    return SimpleUploadedFile(nome, buffer.getvalue(), content_type=f"image/{formato.lower()}")


class ApiTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media = tempfile.mkdtemp()
        cls._media_override = override_settings(MEDIA_ROOT=cls._media)
        cls._media_override.enable()

    @classmethod
    def tearDownClass(cls):
        cls._media_override.disable()
        shutil.rmtree(cls._media, ignore_errors=True)
        super().tearDownClass()

    def criar_usuario(self, email, tipo=Usuario.Tipo.ADOTANTE, nome=None, telefone=""):
        return Usuario.objects.create_user(email, SENHA, nome=nome or email.split("@")[0], tipo=tipo, telefone=telefone)

    def entrar(self, usuario):
        self.client.force_authenticate(usuario)

    def sair(self):
        self.client.force_authenticate(None)
