from django.db import transaction

from .imagens import remover_foto_sem_uso


def remover_foto_do_animal_excluido(sender, instance, **kwargs):
    nome, storage = instance.foto.name, instance.foto.storage
    transaction.on_commit(lambda: remover_foto_sem_uso(storage, nome))
