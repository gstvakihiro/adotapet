import uuid

from django.db import models


class ModeloBase(models.Model):
    """
    Base para todos os modelos do AdotaPet.

    - id em UUID, e não número sequencial (RNF07, evita IDOR pela URL)
    - datas de criação e de última alteração preenchidas automaticamente

    Uso (Fase 1):  class Animal(ModeloBase): ...
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
