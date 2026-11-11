import re

from django.core.exceptions import ValidationError

CARACTERES_DE_TELEFONE = re.compile(r"[\d\s()+\-]+")


def validar_telefone(valor):
    if not valor:
        return
    if not CARACTERES_DE_TELEFONE.fullmatch(valor):
        raise ValidationError("Use apenas números, espaços, parênteses, + e -.")
    digitos = re.sub(r"\D", "", valor)
    if not 10 <= len(digitos) <= 13:
        raise ValidationError("Informe o telefone com DDD, por exemplo (17) 99999-0000.")
