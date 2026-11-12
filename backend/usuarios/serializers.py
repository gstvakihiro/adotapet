from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import MENSAGEM_EMAIL_REPETIDO, Usuario
from .tokens import adicionar_dados_do_usuario


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
            with transaction.atomic():
                return Usuario.objects.create_user(password=senha, **dados)
        except IntegrityError:
            if Usuario.objects.filter(email__iexact=dados["email"]).exists():
                raise serializers.ValidationError({"email": [MENSAGEM_EMAIL_REPETIDO]})
            raise


class LoginSerializer(TokenObtainPairSerializer):
    default_error_messages = {"no_active_account": "Email ou senha incorretos."}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        del self.fields["password"]
        self.fields["senha"] = serializers.CharField(
            write_only=True, trim_whitespace=False, max_length=128, style={"input_type": "password"}
        )

    def validate(self, dados):
        dados["password"] = dados.pop("senha")
        return super().validate(dados)

    @classmethod
    def get_token(cls, usuario):
        return adicionar_dados_do_usuario(super().get_token(usuario), usuario)
