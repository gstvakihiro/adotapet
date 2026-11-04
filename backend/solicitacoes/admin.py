from django.contrib import admin

from .models import SolicitacaoAdocao


@admin.register(SolicitacaoAdocao)
class SolicitacaoAdocaoAdmin(admin.ModelAdmin):
    list_display = ("animal", "adotante", "status", "criado_em")
    list_filter = ("status",)
    search_fields = ("animal__nome", "adotante__nome", "adotante__email")
