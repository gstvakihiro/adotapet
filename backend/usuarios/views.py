from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.limites import ComLimiteDeTentativas

from .serializers import CadastroSerializer, LoginSerializer, RenovarTokenSerializer, UsuarioSerializer
from .tokens import gerar_tokens


class CadastroView(ComLimiteDeTentativas, generics.CreateAPIView):
    throttle_scope = "cadastro"
    serializer_class = CadastroSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response({**serializer.data, **gerar_tokens(usuario)}, status=status.HTTP_201_CREATED)


class LoginView(ComLimiteDeTentativas, TokenObtainPairView):
    throttle_scope = "login"
    serializer_class = LoginSerializer


class RenovarTokenView(ComLimiteDeTentativas, TokenRefreshView):
    throttle_scope = "renovar"
    serializer_class = RenovarTokenSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """Devolve quem está logado, a partir do token enviado no cabeçalho."""

    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user
