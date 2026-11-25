import animais.imagens
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("animais", "0002_uf_e_limites"),
    ]

    operations = [
        migrations.AlterField(
            model_name="animal",
            name="foto",
            field=models.ImageField(
                help_text="Formatos aceitos: JPG, PNG ou WebP.",
                upload_to=animais.imagens.nome_da_foto,
                validators=[
                    django.core.validators.FileExtensionValidator(
                        ["jpg", "jpeg", "png", "webp"],
                        message="Este formato não é aceito. Envie a foto em JPG, PNG ou WebP.",
                    )
                ],
                verbose_name="foto",
            ),
        ),
    ]
