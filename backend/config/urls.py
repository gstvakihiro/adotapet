from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    # Fase 2: path("api/auth/", include("usuarios.urls")),
    # Fase 3: path("api/animais/", include("animais.urls")),
    # Fase 4: path("api/solicitacoes/", include("solicitacoes.urls")),
]

if settings.DEBUG:
    # Em desenvolvimento, o próprio Django serve as fotos enviadas.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
