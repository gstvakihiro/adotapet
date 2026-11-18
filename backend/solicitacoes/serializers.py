from django.db import IntegrityError, transaction
from rest_framework import serializers

from animais.models import Animal

from .models import MENSAGEM_JA_EXISTE_ACEITA, MENSAGEM_SOLICITACAO_REPETIDA, SolicitacaoAdocao

MENSAGEM_ANIMAL_ADOTADO = "Não foi possível enviar: este animal acabou de ser adotado."


class AnimalResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = ("id", "nome", "especie", "sexo", "idade", "porte", "cidade", "uf", "status", "foto")
        read_only_fields = fields


def contato(usuario, solicitacao):
    dados = {"nome": usuario.nome}
    if solicitacao.status == SolicitacaoAdocao.Status.ACEITA:
        dados.update(email=usuario.email, telefone=usuario.telefone)
    return dados


class SolicitacaoAdotanteSerializer(serializers.ModelSerializer):
    animal = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(),
        write_only=True,
        error_messages={"does_not_exist": "Animal não encontrado.", "required": "Informe o animal."},
    )
    animal_dados = AnimalResumoSerializer(source="animal", read_only=True)
    responsavel = serializers.SerializerMethodField()

    class Meta:
        model = SolicitacaoAdocao
        fields = ("id", "status", "criado_em", "animal", "animal_dados", "responsavel")
        read_only_fields = ("id", "status", "criado_em")

    def get_responsavel(self, solicitacao):
        return contato(solicitacao.animal.responsavel, solicitacao)

    def validate_animal(self, animal):
        if not animal.esta_disponivel:
            raise serializers.ValidationError(MENSAGEM_ANIMAL_ADOTADO)
        if animal.solicitacoes.filter(adotante=self.context["request"].user).exists():
            raise serializers.ValidationError(MENSAGEM_SOLICITACAO_REPETIDA)
        return animal

    def create(self, dados):
        try:
            with transaction.atomic():
                return SolicitacaoAdocao.objects.create(adotante=self.context["request"].user, **dados)
        except IntegrityError:
            raise serializers.ValidationError({"animal": [MENSAGEM_SOLICITACAO_REPETIDA]})


class SolicitacaoResponsavelSerializer(serializers.ModelSerializer):
    adotante = serializers.SerializerMethodField()

    class Meta:
        model = SolicitacaoAdocao
        fields = ("id", "status", "criado_em", "adotante")
        read_only_fields = ("id", "criado_em", "adotante")
        extra_kwargs = {"status": {"error_messages": {"invalid_choice": "Status inválido."}}}

    def get_adotante(self, solicitacao):
        return contato(solicitacao.adotante, solicitacao)

    def validate_status(self, status):
        if status == SolicitacaoAdocao.Status.ACEITA:
            outras = SolicitacaoAdocao.objects.filter(animal=self.instance.animal, status=status)
            if outras.exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError(MENSAGEM_JA_EXISTE_ACEITA)
        return status

    def update(self, solicitacao, dados):
        try:
            with transaction.atomic():
                return super().update(solicitacao, dados)
        except IntegrityError:
            raise serializers.ValidationError({"status": [MENSAGEM_JA_EXISTE_ACEITA]})
