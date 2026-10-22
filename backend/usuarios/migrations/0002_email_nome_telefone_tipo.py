import usuarios.managers
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="usuario",
            options={
                "ordering": ["nome"],
                "verbose_name": "usuário",
                "verbose_name_plural": "usuários",
            },
        ),
        migrations.AlterModelManagers(
            name="usuario",
            managers=[
                ("objects", usuarios.managers.UsuarioManager()),
            ],
        ),
        migrations.RemoveField(
            model_name="usuario",
            name="first_name",
        ),
        migrations.RemoveField(
            model_name="usuario",
            name="last_name",
        ),
        migrations.RemoveField(
            model_name="usuario",
            name="username",
        ),
        migrations.AddField(
            model_name="usuario",
            name="nome",
            field=models.CharField(default="", max_length=150, verbose_name="nome"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="usuario",
            name="telefone",
            field=models.CharField(blank=True, max_length=20, verbose_name="telefone"),
        ),
        migrations.AddField(
            model_name="usuario",
            name="tipo",
            field=models.CharField(
                choices=[("adotante", "Adotante"), ("responsavel", "Responsável")],
                default="adotante",
                max_length=20,
                verbose_name="tipo",
            ),
        ),
        migrations.AlterField(
            model_name="usuario",
            name="email",
            field=models.EmailField(max_length=254, unique=True, verbose_name="email"),
        ),
    ]
