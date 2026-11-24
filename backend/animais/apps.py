from django.apps import AppConfig
from django.db.models.signals import post_delete


class AnimaisConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "animais"
    verbose_name = "Animais"

    def ready(self):
        from .sinais import remover_foto_do_animal_excluido

        post_delete.connect(remover_foto_do_animal_excluido, sender=self.get_model("Animal"))
