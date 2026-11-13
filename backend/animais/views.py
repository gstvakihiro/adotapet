from django.db.models import Count, Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissoes import EhResponsavel

from .models import FAIXAS_IDADE, Animal
from .serializers import AnimalPublicoSerializer, AnimalResponsavelSerializer


def _valores(request, nome):
    return [valor for valor in request.query_params.get(nome, "").split(",") if valor]


def filtrar_por_idade(queryset, faixas):
    condicao = Q()
    for faixa in faixas:
        if faixa not in FAIXAS_IDADE:
            continue
        minimo, maximo = FAIXAS_IDADE[faixa]
        intervalo = Q(idade__gte=minimo)
        if maximo is not None:
            intervalo &= Q(idade__lte=maximo)
        condicao |= intervalo
    return queryset.filter(condicao) if condicao else queryset


class AnimalListaView(generics.ListAPIView):
    serializer_class = AnimalPublicoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        animais = Animal.objects.filter(status=Animal.Status.DISPONIVEL).select_related("responsavel")
        for campo in ("especie", "sexo", "porte"):
            valores = _valores(self.request, campo)
            if valores:
                animais = animais.filter(**{f"{campo}__in": valores})
        animais = filtrar_por_idade(animais, _valores(self.request, "idade"))
        cidade = self.request.query_params.get("cidade", "").strip()
        uf = self.request.query_params.get("uf", "").strip().upper()
        if cidade:
            animais = animais.filter(cidade__iexact=cidade)
        if uf:
            animais = animais.filter(uf=uf)
        return animais


class AnimalDetalheView(generics.RetrieveAPIView):
    serializer_class = AnimalPublicoSerializer
    permission_classes = [AllowAny]
    queryset = Animal.objects.select_related("responsavel")


class CidadesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cidades = {}
        for cidade, uf in Animal.objects.filter(status=Animal.Status.DISPONIVEL).values_list("cidade", "uf"):
            cidades.setdefault((cidade.lower(), uf), {"cidade": cidade, "uf": uf})
        return Response(sorted(cidades.values(), key=lambda item: (item["cidade"].lower(), item["uf"])))


class MeusAnimaisMixin:
    serializer_class = AnimalResponsavelSerializer
    permission_classes = [EhResponsavel]

    def get_queryset(self):
        return Animal.objects.filter(responsavel=self.request.user).annotate(
            pendentes=Count("solicitacoes", filter=Q(solicitacoes__status="pendente"))
        )


class MeusAnimaisView(MeusAnimaisMixin, generics.ListCreateAPIView):
    pagination_class = None

    def get_queryset(self):
        animais = super().get_queryset()
        status = self.request.query_params.get("status")
        if status in Animal.Status.values:
            animais = animais.filter(status=status)
        return animais

    def perform_create(self, serializer):
        serializer.save(responsavel=self.request.user, status=Animal.Status.DISPONIVEL)


class MeuAnimalView(MeusAnimaisMixin, generics.RetrieveUpdateAPIView):
    pass
