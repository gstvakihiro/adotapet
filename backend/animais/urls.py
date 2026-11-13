from django.urls import path

from .views import AnimalDetalheView, AnimalListaView, CidadesView, MeuAnimalView, MeusAnimaisView

urlpatterns = [
    path("animais/", AnimalListaView.as_view(), name="animais"),
    path("animais/cidades/", CidadesView.as_view(), name="animais_cidades"),
    path("animais/<uuid:pk>/", AnimalDetalheView.as_view(), name="animal"),
    path("meus-animais/", MeusAnimaisView.as_view(), name="meus_animais"),
    path("meus-animais/<uuid:pk>/", MeuAnimalView.as_view(), name="meu_animal"),
]
