from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Confirma que a API está no ar e que consegue falar com o banco."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        banco = "ok"
    except Exception:  # noqa: BLE001 - qualquer falha de conexão conta como erro
        banco = "erro"

    return Response(
        {"status": "ok", "banco": banco, "motor": connection.vendor},
        status=200 if banco == "ok" else 503,
    )
