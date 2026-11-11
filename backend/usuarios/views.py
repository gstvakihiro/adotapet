from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .serializers import UsuarioSerializer


class MeView(generics.RetrieveAPIView):
    """Devolve quem está logado, a partir do token enviado no cabeçalho."""

    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
