from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase

from animais.models import Animal
from usuarios.models import Usuario

from .models import SolicitacaoAdocao


class SolicitacaoAdocaoTests(TestCase):
    def setUp(self):
        self.responsavel = Usuario.objects.create_user(
            email="ong@exemplo.com", password="senha-forte-123", nome="ONG", tipo=Usuario.Tipo.RESPONSAVEL
        )
        self.adotante = Usuario.objects.create_user(email="ana@exemplo.com", password="senha-forte-123", nome="Ana")
        self.animal = Animal.objects.create(
            nome="Rex", cidade="Votuporanga", especie=Animal.Especie.CACHORRO, sexo=Animal.Sexo.MACHO,
            idade=2, porte=Animal.Porte.MEDIO, foto="animais/rex.jpg", responsavel=self.responsavel,
        )

    def test_padroes(self):
        solicitacao = SolicitacaoAdocao.objects.create(adotante=self.adotante, animal=self.animal)
        self.assertEqual(solicitacao.status, SolicitacaoAdocao.Status.PENDENTE)
        self.assertIsNotNone(solicitacao.criado_em)
        self.assertEqual(self.adotante.solicitacoes.count(), 1)
        self.assertEqual(self.animal.solicitacoes.count(), 1)

    def test_responsavel_nao_pode_ser_adotante(self):
        with self.assertRaises(ValidationError) as erro:
            SolicitacaoAdocao(adotante=self.responsavel, animal=self.animal).full_clean()
        self.assertIn("adotante", erro.exception.message_dict)

    def test_segunda_solicitacao_para_o_mesmo_animal_e_recusada(self):
        SolicitacaoAdocao.objects.create(adotante=self.adotante, animal=self.animal)
        with self.assertRaises(ValidationError):
            SolicitacaoAdocao(adotante=self.adotante, animal=self.animal).full_clean()
        with self.assertRaises(IntegrityError):
            SolicitacaoAdocao.objects.create(adotante=self.adotante, animal=self.animal)

    def test_outro_adotante_pode_pedir_o_mesmo_animal(self):
        outro = Usuario.objects.create_user(email="bia@exemplo.com", password="senha-forte-123", nome="Bia")
        SolicitacaoAdocao.objects.create(adotante=self.adotante, animal=self.animal)
        SolicitacaoAdocao(adotante=outro, animal=self.animal).full_clean()
