from django import forms
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from .models import MENSAGEM_EMAIL_REPETIDO, Usuario


class EmailUnicoMixin:
    def clean_email(self):
        email = Usuario.objects.normalizar_email(self.cleaned_data.get("email"))
        outros = Usuario.objects.filter(email__iexact=email).exclude(pk=self.instance.pk)
        if outros.exists():
            raise forms.ValidationError(MENSAGEM_EMAIL_REPETIDO)
        return email


class UsuarioCreationForm(EmailUnicoMixin, AdminUserCreationForm):
    class Meta:
        model = Usuario
        fields = ("email", "nome", "telefone", "tipo")


class UsuarioChangeForm(EmailUnicoMixin, UserChangeForm):
    class Meta:
        model = Usuario
        fields = "__all__"
