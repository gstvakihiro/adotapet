import usuarios.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0002_email_nome_telefone_tipo"),
    ]

    operations = [
        migrations.AlterField(
            model_name="usuario",
            name="telefone",
            field=models.CharField(
                blank=True,
                max_length=20,
                validators=[usuarios.validators.validar_telefone],
                verbose_name="telefone",
            ),
        ),
    ]
