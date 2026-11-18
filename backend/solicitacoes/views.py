from django.db.models import Case, IntegerField, Value, When
from django.shortcuts import get_object_or_404
from rest_framework import generics

from animais.models import Animal
from core.permissoes import EhAdotante, EhResponsavel

from .models import SolicitacaoAdocao
from .serializers import SolicitacaoAdotanteSerializer, SolicitacaoResponsavelSerializer


def filtrar_status(request, solicitacoes):
    status = request.query_params.get("status")
    if status in SolicitacaoAdocao.Status.values:
        return solicitacoes.filter(status=status)
    return solicitacoes


class MinhasSolicitacoesView(generics.ListCreateAPIView):
    serializer_class = SolicitacaoAdotanteSerializer
    permission_classes = [EhAdotante]
    pagination_class = None

    def get_queryset(self):
        solicitacoes = SolicitacaoAdocao.objects.filter(adotante=self.request.user).select_related(
            "animal", "animal__responsavel"
        )
        return filtrar_status(self.request, solicitacoes)


class InteressadosView(generics.ListAPIView):
    serializer_class = SolicitacaoResponsavelSerializer
    permission_classes = [EhResponsavel]
    pagination_class = None

    def get_queryset(self):
        animal = get_object_or_404(Animal, pk=self.kwargs["animal_id"], responsavel=self.request.user)
        solicitacoes = animal.solicitacoes.select_related("adotante").annotate(
            pendente_primeiro=Case(When(status="pendente", then=Value(0)), default=Value(1), output_field=IntegerField())
        ).order_by("pendente_primeiro", "-criado_em")
        return filtrar_status(self.request, solicitacoes)


class ResponderSolicitacaoView(generics.UpdateAPIView):
    serializer_class = SolicitacaoResponsavelSerializer
    permission_classes = [EhResponsavel]
    http_method_names = ["patch"]

    def get_queryset(self):
        return SolicitacaoAdocao.objects.filter(animal__responsavel=self.request.user).select_related("adotante", "animal")
