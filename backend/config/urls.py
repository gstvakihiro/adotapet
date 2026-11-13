from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "AdotaPet"
admin.site.site_title = "AdotaPet"
admin.site.index_title = "Painel administrativo"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("api/auth/", include("usuarios.urls")),
    path("api/", include("animais.urls")),
    path("api/", include("solicitacoes.urls")),
]

if settings.DEBUG:
    # Em desenvolvimento, o próprio Django serve as fotos enviadas.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
