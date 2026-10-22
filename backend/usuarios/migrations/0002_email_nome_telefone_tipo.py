import django.db.models.functions.text
import usuarios.managers
from django.db import migrations, models


def preencher_email_e_nome(apps, schema_editor):
    Usuario = apps.get_model("usuarios", "Usuario")
    usados = set()
    for usuario in Usuario.objects.order_by("date_joined", "pk"):
        email = (usuario.email or "").strip().lower()
        if not email or email in usados:
            email = f"sem-email-{usuario.pk}@adotapet.invalid"
        usados.add(email)
        nome = " ".join(parte for parte in (usuario.first_name, usuario.last_name) if parte)
        usuario.email = email
        usuario.nome = nome or usuario.username
        usuario.save(update_fields=["email", "nome"])


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
        migrations.RunPython(preencher_email_e_nome),
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
        migrations.AlterField(
            model_name="usuario",
            name="email",
            field=models.EmailField(max_length=254, unique=True, verbose_name="email"),
        ),
        migrations.AddConstraint(
            model_name="usuario",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("email"),
                name="usuario_email_ci_unico",
                violation_error_message="Já existe um usuário com este email.",
            ),
        ),
    ]
