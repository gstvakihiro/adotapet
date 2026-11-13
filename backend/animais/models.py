from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MaxValueValidator
from django.db import models

from core.models import ModeloBase

EXTENSOES_FOTO = ["jpg", "jpeg", "png", "webp"]
MENSAGEM_FORMATO_FOTO = "Este formato não é aceito. Envie a foto em JPG, PNG ou WebP."
IDADE_MAXIMA = 30
FAIXAS_IDADE = {
    "filhote": (0, 0),
    "jovem": (1, 3),
    "adulto": (4, 7),
    "idoso": (8, None),
}


class Animal(ModeloBase):
    class Especie(models.TextChoices):
        CACHORRO = "cachorro", "Cachorro"
        GATO = "gato", "Gato"
        OUTRO = "outro", "Outro"

    class Sexo(models.TextChoices):
        MACHO = "macho", "Macho"
        FEMEA = "femea", "Fêmea"

    class Porte(models.TextChoices):
        PEQUENO = "pequeno", "Pequeno"
        MEDIO = "medio", "Médio"
        GRANDE = "grande", "Grande"

    class Status(models.TextChoices):
        DISPONIVEL = "disponivel", "Disponível"
        ADOTADO = "adotado", "Adotado"

    class UF(models.TextChoices):
        AC = "AC", "Acre"
        AL = "AL", "Alagoas"
        AP = "AP", "Amapá"
        AM = "AM", "Amazonas"
        BA = "BA", "Bahia"
        CE = "CE", "Ceará"
        DF = "DF", "Distrito Federal"
        ES = "ES", "Espírito Santo"
        GO = "GO", "Goiás"
        MA = "MA", "Maranhão"
        MT = "MT", "Mato Grosso"
        MS = "MS", "Mato Grosso do Sul"
        MG = "MG", "Minas Gerais"
        PA = "PA", "Pará"
        PB = "PB", "Paraíba"
        PR = "PR", "Paraná"
        PE = "PE", "Pernambuco"
        PI = "PI", "Piauí"
        RJ = "RJ", "Rio de Janeiro"
        RN = "RN", "Rio Grande do Norte"
        RS = "RS", "Rio Grande do Sul"
        RO = "RO", "Rondônia"
        RR = "RR", "Roraima"
        SC = "SC", "Santa Catarina"
        SP = "SP", "São Paulo"
        SE = "SE", "Sergipe"
        TO = "TO", "Tocantins"

    nome = models.CharField("nome", max_length=100)
    cidade = models.CharField("cidade", max_length=100)
    uf = models.CharField("UF", max_length=2, choices=UF.choices)
    descricao = models.TextField("descrição", blank=True)
    especie = models.CharField("espécie", max_length=20, choices=Especie.choices)
    sexo = models.CharField("sexo", max_length=10, choices=Sexo.choices)
    idade = models.PositiveSmallIntegerField(
        "idade (anos)", help_text="0 = menos de 1 ano", validators=[MaxValueValidator(IDADE_MAXIMA)]
    )
    porte = models.CharField("porte", max_length=10, choices=Porte.choices)
    status = models.CharField("status", max_length=10, choices=Status.choices, default=Status.DISPONIVEL)
    foto = models.ImageField(
        "foto",
        upload_to="animais/",
        validators=[FileExtensionValidator(EXTENSOES_FOTO, message=MENSAGEM_FORMATO_FOTO)],
        help_text="Formatos aceitos: JPG, PNG ou WebP.",
    )
    responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="responsável",
        on_delete=models.CASCADE,
        related_name="animais",
        limit_choices_to={"tipo": "responsavel"},
    )

    class Meta:
        verbose_name = "animal"
        verbose_name_plural = "animais"
        ordering = ["-criado_em"]

    def __str__(self):
        return self.nome

    @property
    def esta_disponivel(self):
        return self.status == self.Status.DISPONIVEL

    def clean(self):
        super().clean()
        if self.responsavel_id and not self.responsavel.is_responsavel:
            raise ValidationError({"responsavel": "O usuário escolhido não é do tipo responsável."})
