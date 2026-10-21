import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """
    Usuário do AdotaPet.

    Criado já na Fase 0 só com o id em UUID, porque o Django exige que o
    modelo de usuário próprio exista antes da primeira migração.
    Na Fase 1 entram: login por email, telefone e tipo (adotante/responsável).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        verbose_name = "usuário"
        verbose_name_plural = "usuários"

    def __str__(self):
        return self.get_full_name() or self.username
