from django.core.exceptions import ValidationError
from django.test import TestCase

from usuarios.models import Usuario

from .models import Animal


class AnimalTests(TestCase):
    def setUp(self):
        self.responsavel = Usuario.objects.create_user(
            email="ong@exemplo.com", password="senha-forte-123", nome="ONG", tipo=Usuario.Tipo.RESPONSAVEL
        )

    def criar(self, **extra):
        dados = dict(
            nome="Rex", cidade="Votuporanga", especie=Animal.Especie.CACHORRO, sexo=Animal.Sexo.MACHO,
            idade=0, porte=Animal.Porte.MEDIO, foto="animais/rex.jpg", responsavel=self.responsavel,
        )
        dados.update(extra)
        return Animal(**dados)

    def test_padroes(self):
        animal = self.criar()
        animal.save()
        self.assertEqual(animal.status, Animal.Status.DISPONIVEL)
        self.assertEqual(animal.descricao, "")
        self.assertEqual(self.responsavel.animais.count(), 1)

    def test_adotante_nao_pode_ser_responsavel(self):
        adotante = Usuario.objects.create_user(email="a@exemplo.com", password="senha-forte-123", nome="Ana")
        with self.assertRaises(ValidationError):
            self.criar(responsavel=adotante).full_clean()

    def test_idade_negativa_invalida(self):
        with self.assertRaises(ValidationError):
            self.criar(idade=-1).full_clean()
