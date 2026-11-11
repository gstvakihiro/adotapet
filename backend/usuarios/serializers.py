from rest_framework import serializers

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Dados públicos do usuário logado, usados no /me."""

    class Meta:
        model = Usuario
        fields = ("id", "email", "nome", "telefone", "tipo")
        read_only_fields = ("id", "email", "tipo")
