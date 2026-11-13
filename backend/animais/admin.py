from django.contrib import admin

from .models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ("nome", "especie", "sexo", "idade", "porte", "cidade", "uf", "status", "responsavel")
    list_filter = ("especie", "porte", "status", "uf", "cidade")
    search_fields = ("nome", "cidade", "responsavel__nome", "responsavel__email")
