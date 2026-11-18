from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image, ImageDraw

from animais.models import Animal
from solicitacoes.models import SolicitacaoAdocao
from usuarios.models import Usuario

SENHA = "AdotaPet2026!"
DOMINIO = "@adotapet.demo"

RESPONSAVEIS = [
    ("ong" + DOMINIO, "ONG Patas Amigas", "(17) 3421-0000"),
    ("maria" + DOMINIO, "Maria Souza", "(17) 99876-5432"),
]
ADOTANTES = [
    ("joao" + DOMINIO, "João Pereira", "(17) 99123-4567"),
    ("ana" + DOMINIO, "Ana Lima", ""),
]
ANIMAIS = [
    ("Thor", "cachorro", "macho", 3, "grande", "Votuporanga", "Brincalhão e muito leal. Vacinado e castrado.", "#c2410c"),
    ("Mel", "cachorro", "femea", 0, "pequeno", "Votuporanga", "Filhote carinhosa, adora colo e se dá bem com crianças.", "#d97706"),
    ("Luna", "gato", "femea", 2, "pequeno", "Fernandópolis", "Tranquila e independente. Usa caixinha de areia.", "#7c3aed"),
    ("Bob", "cachorro", "macho", 9, "medio", "Votuporanga", "Idoso calmo, perfeito para quem quer um companheiro sossegado.", "#0f766e"),
    ("Nina", "gato", "femea", 0, "pequeno", "Votuporanga", "Filhote curiosa e cheia de energia.", "#db2777"),
    ("Pipoca", "outro", "macho", 1, "pequeno", "Jales", "Coelho dócil, acostumado com gente.", "#65a30d"),
    ("Max", "cachorro", "macho", 5, "grande", "Fernandópolis", "Ótimo com outros cães. Precisa de espaço para correr.", "#2563eb"),
    ("Frida", "gato", "femea", 6, "medio", "Votuporanga", "Carinhosa e conversadeira. Castrada.", "#9333ea"),
]


def foto_ilustrada(nome, cor):
    imagem = Image.new("RGB", (800, 600), cor)
    desenho = ImageDraw.Draw(imagem)
    for raio, alfa in ((420, 40), (300, 30)):
        desenho.ellipse((560 - raio, -raio // 2, 560 + raio, raio + 40), fill=tuple(min(255, int(c, 16) + alfa) for c in (cor[1:3], cor[3:5], cor[5:7])))
    branco = (255, 255, 255)
    desenho.ellipse((310, 300, 490, 450), fill=branco)
    for x, y in ((250, 220), (350, 160), (450, 160), (550, 220)):
        desenho.ellipse((x - 42, y - 52, x + 42, y + 52), fill=branco)
    saida = BytesIO()
    imagem.save(saida, "JPEG", quality=88)
    return ContentFile(saida.getvalue(), name=f"demo-{nome.lower()}.jpg")


class Command(BaseCommand):
    help = "Cria contas e animais de demonstração (domínio @adotapet.demo). Use --limpar para apagar antes."

    def add_arguments(self, parser):
        parser.add_argument("--limpar", action="store_true", help="Apaga os dados de demonstração antes de criar.")

    @transaction.atomic
    def handle(self, *args, limpar=False, **opcoes):
        if limpar:
            apagados, _ = Usuario.objects.filter(email__endswith=DOMINIO).delete()
            self.stdout.write(f"Dados de demonstração apagados ({apagados} registros).")

        if Usuario.objects.filter(email__endswith=DOMINIO).exists():
            self.stdout.write(self.style.WARNING("Os dados de demonstração já existem. Use --limpar para recriar."))
            return

        responsaveis = [
            Usuario.objects.create_user(email, SENHA, nome=nome, telefone=telefone, tipo=Usuario.Tipo.RESPONSAVEL)
            for email, nome, telefone in RESPONSAVEIS
        ]
        adotantes = [
            Usuario.objects.create_user(email, SENHA, nome=nome, telefone=telefone)
            for email, nome, telefone in ADOTANTES
        ]

        animais = []
        for indice, (nome, especie, sexo, idade, porte, cidade, descricao, cor) in enumerate(ANIMAIS):
            animal = Animal(
                nome=nome, especie=especie, sexo=sexo, idade=idade, porte=porte, cidade=cidade, uf="SP",
                descricao=descricao, responsavel=responsaveis[indice % 2],
            )
            animal.foto.save(f"demo-{nome.lower()}.jpg", foto_ilustrada(nome, cor), save=False)
            animal.save()
            animais.append(animal)

        joao, ana = adotantes
        SolicitacaoAdocao.objects.create(adotante=joao, animal=animais[0])
        SolicitacaoAdocao.objects.create(adotante=ana, animal=animais[0])
        SolicitacaoAdocao.objects.create(adotante=joao, animal=animais[2], status=SolicitacaoAdocao.Status.ACEITA)
        SolicitacaoAdocao.objects.create(adotante=ana, animal=animais[3], status=SolicitacaoAdocao.Status.RECUSADA)

        self.stdout.write(self.style.SUCCESS(f"Criados {len(animais)} animais e 4 contas de demonstração."))
        self.stdout.write(f"Senha de todas as contas: {SENHA}")
        for email, nome, _ in RESPONSAVEIS:
            self.stdout.write(f"  Responsável: {email} ({nome})")
        for email, nome, _ in ADOTANTES:
            self.stdout.write(f"  Adotante:    {email} ({nome})")
