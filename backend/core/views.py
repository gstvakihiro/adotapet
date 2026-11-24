import logging

from django.db import DatabaseError, connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Confirma que a API está no ar e que consegue falar com o banco."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except DatabaseError:
        logger.exception("Banco indisponível na verificação de saúde")
        return Response({"status": "erro", "banco": "erro"}, status=503)
    return Response({"status": "ok", "banco": "ok", "motor": connection.vendor})
