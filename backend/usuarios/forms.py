from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from .models import Usuario


class UsuarioCreationForm(AdminUserCreationForm):
    class Meta:
        model = Usuario
        fields = ("email", "nome", "telefone", "tipo")


class UsuarioChangeForm(UserChangeForm):
    class Meta:
        model = Usuario
        fields = "__all__"
