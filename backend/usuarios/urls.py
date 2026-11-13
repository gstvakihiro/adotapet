from django.urls import path

from .views import CadastroView, LoginView, MeView, RenovarTokenView

urlpatterns = [
    path("cadastro/", CadastroView.as_view(), name="cadastro"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/renovar/", RenovarTokenView.as_view(), name="token_renovar"),
    path("me/", MeView.as_view(), name="me"),
]
