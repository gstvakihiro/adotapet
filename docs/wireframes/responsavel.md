# Wireframes · Telas do responsável

Telas da issue #10, desenhadas no artefato de Design do Claude:
<https://claude.ai/artifact/8xMVEBEnuB8EaSumDS3Tmj>

Seguem o estilo visual da issue #8 (cores, fontes Nunito e Inter, botões, campos, cartão de animal e avisos).
Cada tela tem versão para computador (1280 px) e celular (390 px), conforme o RNF01.

| Arquivo | Tela |
| :--- | :--- |
| `responsavel-01-meus-animais-computador.png` · `responsavel-02-meus-animais-celular.png` | Meus animais, com o botão Disponível / Adotado em cada animal |
| `responsavel-03-cadastro-animal-computador.png` · `responsavel-04-cadastro-animal-celular.png` | Formulário de cadastro de animal, com envio de foto |
| `responsavel-05-foto-estados-e-edicao.png` | Estados do campo de foto (sem foto, erros, enviando) e modo edição |
| `responsavel-06-interessados-computador.png` · `responsavel-07-interessados-celular.png` | Interessados em um animal, com Aceitar e Recusar |

Textos entre colchetes, como `[Nome]`, são espaços para dados reais.

## Meus animais

- Cada animal tem um controle **Disponível / Adotado**, que troca o status na hora, sem abrir o formulário.
- O animal adotado sai da busca pública, mas continua nesta lista. O aviso verde confirma a troca e oferece **Desfazer**.
- Filtros por status: Todos, Disponíveis e Adotados.
- O número em **Interessados** conta os pedidos ainda sem resposta. Sem pedidos, o botão fica desativado.

## Cadastro e edição de animal

Os campos seguem o modelo `animais.Animal`: nome, espécie (cachorro, gato ou outro), sexo, idade em anos (0 = menos de 1 ano), porte, cidade, descrição (opcional) e foto.
O status não está no formulário: começa como disponível e muda em Meus animais.
A edição usa o mesmo formulário, já preenchido, com o título "Editar [Nome]", a foto atual com **Trocar foto** e o botão **Salvar alterações**.

### Foto

Segue a observação do Patrick na issue #10:

- O backend aceita JPG, PNG e WebP. Os formatos aceitos aparecem escritos perto do campo.
- O campo deve ser `<input type="file" accept="image/jpeg,image/png,image/webp">`, e não `accept="image/*"`, para o iPhone converter a foto HEIC em JPEG ao enviar.
- Mensagens de erro previstas:
  - sem foto: "Escolha uma foto do animal."
  - formato não aceito: "Este formato não é aceito. Envie a foto em JPG, PNG ou WebP."
  - arquivo que o Pillow não reconhece como imagem (vem do backend): "Não conseguimos abrir este arquivo como imagem. Tente outra foto."
- O botão de envio tem o estado **Enviando…**, travado para não cadastrar duas vezes, porque fotos de celular pesam de 3 a 12 MB.
- No celular o campo abre a câmera ou a galeria. No computador há uma área para arrastar a foto.
- O limite de tamanho e o redimensionamento da foto serão decididos na API (Fase 3).

## Interessados

- Aberta pelo botão **Interessados** de cada animal. Mostra um resumo do animal, com o mesmo controle Disponível / Adotado.
- Pedidos pendentes aparecem primeiro, com **Aceitar** e **Recusar**. Os status são os mesmos da tela "Minhas solicitações" do adotante (#9): pendente, aceito ou recusado.
- O contato do adotante (email e telefone, se informado) só aparece depois que o pedido é aceito.
- Filtros: Todos, Pendentes, Aceitos e Recusados.

## Para o grupo decidir

- Aceitar ou recusar sem pedir confirmação, com **Desfazer** no aviso (como desenhado), ou abrir uma confirmação antes.
- Se aceitar um pedido deve marcar o animal como adotado automaticamente. No desenho, o responsável marca à mão quando a adoção se concretiza.
