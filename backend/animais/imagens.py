import uuid
from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image, ImageOps

TAMANHO_MAXIMO_BYTES = 12 * 1024 * 1024
PIXELS_MAXIMOS = 50_000_000
LADO_MAXIMO_PX = 1600
FORMATOS = {"JPEG": ("jpg", "image/jpeg"), "PNG": ("png", "image/png"), "WEBP": ("webp", "image/webp")}


class FormatoNaoAceito(ValueError):
    pass


class ResolucaoAltaDemais(ValueError):
    pass


def nome_da_foto(instancia, nome_original):
    extensao = nome_original.rsplit(".", 1)[-1].lower() if "." in nome_original else "jpg"
    return f"animais/{uuid.uuid4().hex}.{extensao}"


def preparar_foto(arquivo):
    arquivo.seek(0)
    with Image.open(arquivo) as original:
        if original.format not in FORMATOS:
            raise FormatoNaoAceito
        if original.width * original.height > PIXELS_MAXIMOS:
            raise ResolucaoAltaDemais
        formato = original.format
        if formato == "JPEG":
            original.draft("RGB", (LADO_MAXIMO_PX, LADO_MAXIMO_PX))
        imagem = ImageOps.exif_transpose(original)
        imagem.thumbnail((LADO_MAXIMO_PX, LADO_MAXIMO_PX))
        if formato == "JPEG" and imagem.mode not in ("RGB", "L"):
            imagem = imagem.convert("RGB")
        saida = BytesIO()
        opcoes = {"quality": 85, "optimize": True} if formato in ("JPEG", "WEBP") else {"optimize": True}
        imagem.save(saida, format=formato, **opcoes)
    extensao, tipo = FORMATOS[formato]
    return InMemoryUploadedFile(saida, "foto", f"foto.{extensao}", tipo, saida.getbuffer().nbytes, None)


def remover_foto_sem_uso(storage, nome):
    from .models import Animal

    if nome and not Animal.objects.filter(foto=nome).exists():
        storage.delete(nome)
