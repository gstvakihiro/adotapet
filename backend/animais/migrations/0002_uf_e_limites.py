import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("animais", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="animal",
            name="uf",
            field=models.CharField(
                choices=[
                    ("AC", "Acre"),
                    ("AL", "Alagoas"),
                    ("AP", "Amapá"),
                    ("AM", "Amazonas"),
                    ("BA", "Bahia"),
                    ("CE", "Ceará"),
                    ("DF", "Distrito Federal"),
                    ("ES", "Espírito Santo"),
                    ("GO", "Goiás"),
                    ("MA", "Maranhão"),
                    ("MT", "Mato Grosso"),
                    ("MS", "Mato Grosso do Sul"),
                    ("MG", "Minas Gerais"),
                    ("PA", "Pará"),
                    ("PB", "Paraíba"),
                    ("PR", "Paraná"),
                    ("PE", "Pernambuco"),
                    ("PI", "Piauí"),
                    ("RJ", "Rio de Janeiro"),
                    ("RN", "Rio Grande do Norte"),
                    ("RS", "Rio Grande do Sul"),
                    ("RO", "Rondônia"),
                    ("RR", "Roraima"),
                    ("SC", "Santa Catarina"),
                    ("SP", "São Paulo"),
                    ("SE", "Sergipe"),
                    ("TO", "Tocantins"),
                ],
                default="SP",
                max_length=2,
                verbose_name="UF",
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="animal",
            name="foto",
            field=models.ImageField(
                help_text="Formatos aceitos: JPG, PNG ou WebP.",
                upload_to="animais/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        ["jpg", "jpeg", "png", "webp"],
                        message="Este formato não é aceito. Envie a foto em JPG, PNG ou WebP.",
                    )
                ],
                verbose_name="foto",
            ),
        ),
        migrations.AlterField(
            model_name="animal",
            name="idade",
            field=models.PositiveSmallIntegerField(
                help_text="0 = menos de 1 ano",
                validators=[django.core.validators.MaxValueValidator(30)],
                verbose_name="idade (anos)",
            ),
        ),
    ]
