from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from animais.models import Animal
from core.models import ModeloBase

MENSAGEM_SOLICITACAO_REPETIDA = "Este adotante já tem uma solicitação para este animal."


class SolicitacaoAdocao(ModeloBase):
    """Pedido de um adotante para adotar um animal. O criado_em é a data da solicitação."""

    class Status(models.TextChoices):
        PENDENTE = "pendente", "Pendente"
        ACEITA = "aceita", "Aceita"
        RECUSADA = "recusada", "Recusada"

    adotante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="adotante",
        on_delete=models.CASCADE,
        related_name="solicitacoes",
        limit_choices_to={"tipo": "adotante"},
    )
    animal = models.ForeignKey(
        Animal,
        verbose_name="animal",
        on_delete=models.CASCADE,
        related_name="solicitacoes",
    )
    status = models.CharField("status", max_length=10, choices=Status.choices, default=Status.PENDENTE)

    class Meta:
        verbose_name = "solicitação de adoção"
        verbose_name_plural = "solicitações de adoção"
        ordering = ["-criado_em"]
        constraints = [
            models.UniqueConstraint(
                fields=["adotante", "animal"],
                name="solicitacao_adotante_animal_unica",
                violation_error_message=MENSAGEM_SOLICITACAO_REPETIDA,
            ),
        ]

    def __str__(self):
        return f"{self.adotante} → {self.animal}"

    def clean(self):
        super().clean()
        if self.adotante_id and not self.adotante.is_adotante:
            raise ValidationError({"adotante": "O usuário escolhido não é do tipo adotante."})
