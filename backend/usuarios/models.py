import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UsuarioManager


class Usuario(AbstractUser):
    class Tipo(models.TextChoices):
        ADOTANTE = "adotante", "Adotante"
        RESPONSAVEL = "responsavel", "Responsável"

    username = None
    first_name = None
    last_name = None

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("email", unique=True)
    nome = models.CharField("nome", max_length=150)
    telefone = models.CharField("telefone", max_length=20, blank=True)
    tipo = models.CharField("tipo", max_length=20, choices=Tipo.choices, default=Tipo.ADOTANTE)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nome"]

    objects = UsuarioManager()

    class Meta:
        verbose_name = "usuário"
        verbose_name_plural = "usuários"
        ordering = ["nome"]

    def __str__(self):
        return self.nome or self.email

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def get_full_name(self):
        return self.nome

    def get_short_name(self):
        return self.nome.split(" ")[0] if self.nome else self.email

    @property
    def is_adotante(self):
        return self.tipo == self.Tipo.ADOTANTE

    @property
    def is_responsavel(self):
        return self.tipo == self.Tipo.RESPONSAVEL
