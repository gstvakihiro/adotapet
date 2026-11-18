from io import BytesIO
from pathlib import Path

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image, ImageOps

TAMANHO_MAXIMO_BYTES = 12 * 1024 * 1024
LADO_MAXIMO_PX = 1600
FORMATOS = {"JPEG": ("jpg", "image/jpeg"), "PNG": ("png", "image/png"), "WEBP": ("webp", "image/webp")}


def preparar_foto(arquivo):
    arquivo.seek(0)
    with Image.open(arquivo) as original:
        formato = original.format if original.format in FORMATOS else "JPEG"
        imagem = ImageOps.exif_transpose(original)
        imagem.thumbnail((LADO_MAXIMO_PX, LADO_MAXIMO_PX))
        if formato == "JPEG" and imagem.mode not in ("RGB", "L"):
            imagem = imagem.convert("RGB")
        saida = BytesIO()
        opcoes = {"quality": 85, "optimize": True} if formato in ("JPEG", "WEBP") else {"optimize": True}
        imagem.save(saida, format=formato, **opcoes)
    extensao, tipo = FORMATOS[formato]
    nome = f"{Path(arquivo.name).stem[:80]}.{extensao}"
    return InMemoryUploadedFile(saida, "foto", nome, tipo, saida.getbuffer().nbytes, None)
