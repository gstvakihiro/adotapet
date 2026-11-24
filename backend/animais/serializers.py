from django.db import transaction
from PIL import Image
from rest_framework import serializers

from .imagens import (
    TAMANHO_MAXIMO_BYTES,
    FormatoNaoAceito,
    ResolucaoAltaDemais,
    preparar_foto,
    remover_foto_sem_uso,
)
from .models import IDADE_MAXIMA, MENSAGEM_FORMATO_FOTO, Animal

MENSAGEM_IDADE = f"Informe a idade em anos, só com números, até {IDADE_MAXIMA}. Use 0 para menos de 1 ano."


class AnimalPublicoSerializer(serializers.ModelSerializer):
    responsavel_nome = serializers.CharField(source="responsavel.nome", read_only=True)
    minha_solicitacao = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = (
            "id", "nome", "especie", "sexo", "idade", "porte", "cidade", "uf", "descricao",
            "status", "foto", "responsavel_nome", "criado_em", "minha_solicitacao",
        )
        read_only_fields = fields

    def get_minha_solicitacao(self, animal):
        usuario = getattr(self.context.get("request"), "user", None)
        if not usuario or not usuario.is_authenticated or not usuario.is_adotante:
            return None
        minhas = getattr(animal, "minhas_solicitacoes", None)
        if minhas is None:
            minhas = list(animal.solicitacoes.filter(adotante=usuario))
        solicitacao = minhas[0] if minhas else None
        return {"id": solicitacao.id, "status": solicitacao.status} if solicitacao else None


class AnimalResponsavelSerializer(serializers.ModelSerializer):
    pendentes = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Animal
        fields = (
            "id", "nome", "especie", "sexo", "idade", "porte", "cidade", "uf", "descricao",
            "status", "foto", "criado_em", "pendentes",
        )
        read_only_fields = ("id", "criado_em", "pendentes")
        extra_kwargs = {
            "nome": {"error_messages": {"required": "Informe o nome do animal.", "blank": "Informe o nome do animal."}},
            "cidade": {"error_messages": {"required": "Informe a cidade.", "blank": "Informe a cidade."}},
            "especie": {"error_messages": {"required": "Escolha a espécie.", "invalid_choice": "Escolha a espécie."}},
            "sexo": {"error_messages": {"required": "Escolha o sexo.", "invalid_choice": "Escolha o sexo."}},
            "porte": {"error_messages": {"required": "Escolha o porte.", "invalid_choice": "Escolha o porte."}},
            "uf": {"error_messages": {"required": "Escolha a UF.", "invalid_choice": "Escolha a UF."}},
            "status": {"error_messages": {"invalid_choice": "Status inválido."}},
            "idade": {
                "error_messages": {
                    "required": MENSAGEM_IDADE,
                    "invalid": MENSAGEM_IDADE,
                    "null": MENSAGEM_IDADE,
                    "min_value": MENSAGEM_IDADE,
                    "max_value": MENSAGEM_IDADE,
                }
            },
            "foto": {
                "error_messages": {
                    "required": "Escolha uma foto do animal.",
                    "invalid": "Escolha uma foto do animal.",
                    "empty": "Escolha uma foto do animal.",
                    "invalid_image": "Não conseguimos abrir este arquivo como imagem. Tente outra foto.",
                }
            },
        }

    def validate_nome(self, nome):
        return nome.strip()

    def validate_cidade(self, cidade):
        return " ".join(cidade.split())

    def validate_foto(self, foto):
        if foto.size > TAMANHO_MAXIMO_BYTES:
            raise serializers.ValidationError("A foto passa de 12 MB. Escolha uma foto menor.")
        try:
            return preparar_foto(foto)
        except FormatoNaoAceito:
            raise serializers.ValidationError(MENSAGEM_FORMATO_FOTO)
        except (ResolucaoAltaDemais, Image.DecompressionBombError):
            raise serializers.ValidationError("A foto tem resolução alta demais. Escolha uma foto menor.")
        except OSError:
            raise serializers.ValidationError("Não conseguimos abrir este arquivo como imagem. Tente outra foto.")

    def update(self, animal, dados):
        if not dados:
            return animal
        foto_anterior = animal.foto.name if "foto" in dados else None
        with transaction.atomic():
            for campo, valor in dados.items():
                setattr(animal, campo, valor)
            animal.save(update_fields=[*dados, "atualizado_em"])
            if foto_anterior and foto_anterior != animal.foto.name:
                storage = animal.foto.storage
                transaction.on_commit(lambda: remover_foto_sem_uso(storage, foto_anterior))
        animal.refresh_from_db()
        return animal
