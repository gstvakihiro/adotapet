from django.urls import path

from .views import InteressadosView, MinhasSolicitacoesView, ResponderSolicitacaoView

urlpatterns = [
    path("solicitacoes/", MinhasSolicitacoesView.as_view(), name="solicitacoes"),
    path("solicitacoes/<uuid:pk>/", ResponderSolicitacaoView.as_view(), name="responder_solicitacao"),
    path("meus-animais/<uuid:animal_id>/solicitacoes/", InteressadosView.as_view(), name="interessados"),
]
