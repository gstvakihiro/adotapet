import re

from django.core.exceptions import ValidationError

FORMATO_DE_TELEFONE = re.compile(r"(?:\+?55\s?)?(?:\(\d{2}\)|\d{2})\s?9?\d{4}[\s-]?\d{4}")


def validar_telefone(valor):
    if valor and not FORMATO_DE_TELEFONE.fullmatch(valor):
        raise ValidationError("Informe um telefone válido com DDD, por exemplo (17) 99999-0000.")
