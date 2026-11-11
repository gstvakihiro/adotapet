from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import serializers

from .models import MENSAGEM_EMAIL_REPETIDO, Usuario


class CadastroSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(
        write_only=True, trim_whitespace=False, max_length=128, style={"input_type": "password"}
    )

    class Meta:
        model = Usuario
        fields = ("id", "email", "nome", "telefone", "tipo", "senha")
        read_only_fields = ("id",)
        extra_kwargs = {
            "email": {"validators": []},
            "tipo": {"error_messages": {"invalid_choice": "Tipo de conta inválido. Use adotante ou responsavel."}},
        }

    def validate_email(self, email):
        email = Usuario.objects.normalizar_email(email)
        if Usuario.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(MENSAGEM_EMAIL_REPETIDO)
        return email

    def validate_senha(self, senha):
        if not senha.strip():
            raise serializers.ValidationError("A senha não pode ser formada só por espaços.")
        return senha

    def validate(self, dados):
        candidato = Usuario(email=dados["email"], nome=dados["nome"])
        try:
            validate_password(dados["senha"], candidato)
        except DjangoValidationError as erro:
            raise serializers.ValidationError({"senha": list(erro.messages)})
        return dados

    def create(self, dados):
        senha = dados.pop("senha")
        try:
            return Usuario.objects.create_user(password=senha, **dados)
        except IntegrityError:
            raise serializers.ValidationError({"email": [MENSAGEM_EMAIL_REPETIDO]})


class UsuarioSerializer(serializers.ModelSerializer):
    """Dados públicos do usuário logado, usados no /me."""

    class Meta:
        model = Usuario
        fields = ("id", "email", "nome", "telefone", "tipo")
        read_only_fields = ("id", "email", "tipo")
