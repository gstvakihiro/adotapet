from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("animais", "0002_uf_e_limites"),
        ("solicitacoes", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="solicitacaoadocao",
            constraint=models.UniqueConstraint(
                condition=models.Q(("status", "aceita")),
                fields=("animal",),
                name="solicitacao_uma_aceita_por_animal",
                violation_error_message="Este animal já tem uma solicitação aceita.",
            ),
        ),
    ]
