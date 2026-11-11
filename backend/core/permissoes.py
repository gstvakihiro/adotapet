"""
Permissões por tipo de usuário, para usar nas views da API.

Uso:  permission_classes = [EhResponsavel]

Sem login, o DRF responde 401. Logado com o tipo errado, responde 403
com a mensagem da permissão.
"""

from rest_framework.permissions import BasePermission


def _logado(request):
    return bool(request.user and request.user.is_authenticated)


class EhAdotante(BasePermission):
    message = "Apenas adotantes podem fazer esta ação."

    def has_permission(self, request, view):
        return _logado(request) and request.user.is_adotante


class EhResponsavel(BasePermission):
    message = "Apenas responsáveis podem fazer esta ação."

    def has_permission(self, request, view):
        return _logado(request) and request.user.is_responsavel
