# Wireframes · Telas do responsável

Telas da issue #10, desenhadas no artefato de Design do Claude:
<https://claude.ai/artifact/8xMVEBEnuB8EaSumDS3Tmj>

Seguem o estilo visual da issue #8 (cores, fontes Nunito e Inter, botões, campos, cartão de animal e avisos).
Cada tela tem versão para computador (1280 px) e celular (390 px), conforme o RNF01.

| Arquivo | Tela |
| :--- | :--- |
| `responsavel-01-meus-animais-computador.png` · `responsavel-02-meus-animais-celular.png` | Meus animais, com o botão Disponível / Adotado em cada animal |
| `responsavel-03-cadastro-animal-computador.png` · `responsavel-04-cadastro-animal-celular.png` | Formulário de cadastro de animal, com envio de foto |
| `responsavel-05-foto-estados-e-edicao.png` | Estados do campo de foto (sem foto, erros, enviando), falha no envio e modo edição |
| `responsavel-06-interessados-computador.png` · `responsavel-07-interessados-celular.png` | Interessados em um animal, com Aceitar e Recusar |
| `responsavel-08-cadastro-erros-computador.png` · `responsavel-09-cadastro-erros-celular.png` | Erros dos campos do cadastro |
| `responsavel-10-meus-animais-vazio-computador.png` · `responsavel-11-meus-animais-vazio-celular.png` | Meus animais vazio e filtro sem resultado |

Textos entre colchetes, como `[Nome]`, são espaços para dados reais.

## Meus animais

- Cada animal tem um controle **Disponível / Adotado**, que troca o status na hora, sem abrir o formulário.
- O animal adotado sai da busca pública, mas continua nesta lista. O aviso verde confirma a troca e oferece **Desfazer**.
- Filtros por status: Todos, Disponíveis e Adotados.
- O número em **Interessados** conta as solicitações ainda sem resposta. Sem solicitações, o botão fica desativado.

### Telas vazias

- Responsável sem nenhum animal: "Você ainda não cadastrou nenhum animal", com **Cadastrar animal**. Os filtros não aparecem.
- Filtro sem resultado: uma mensagem no lugar da grade, com **Ver todos**. "Nenhum animal adotado ainda" no filtro Adotados e "Nenhum animal disponível no momento" no filtro Disponíveis.
- Em Interessados vale a mesma regra: "Nenhuma solicitação pendente", "Nenhuma solicitação aceita" ou "Nenhuma solicitação recusada", com **Ver todas**.

## Cadastro e edição de animal

Os campos seguem o modelo `animais.Animal`: nome, espécie (cachorro, gato ou outro), sexo, idade em anos (0 = menos de 1 ano), porte, cidade, descrição (opcional) e foto.
O status não está no formulário: começa como disponível e muda em Meus animais.
A edição usa o mesmo formulário, já preenchido, com o título "Editar [Nome]", a foto atual com **Trocar foto** e o botão **Salvar alterações**.

### Erros dos campos

Ao enviar com campos inválidos, um aviso no topo pede para conferir os campos, e cada campo mostra a sua mensagem:

| Caso | Mensagem |
| :--- | :--- |
| Nome vazio | "Informe o nome do animal." |
| Espécie, sexo ou porte sem escolha | "Escolha a espécie.", "Escolha o sexo." ou "Escolha o porte." |
| Idade vazia ou com letras | "Informe a idade em anos, só com números. Use 0 para menos de 1 ano." |
| Cidade vazia | "Informe a cidade." |
| Sem foto | "Escolha uma foto do animal." |
| Envio que falha (rede ou servidor) | Aviso geral: "Não foi possível enviar. Confira sua conexão e tente de novo." O botão volta a funcionar, e a foto e os campos continuam preenchidos. |

Nome e cidade usam `maxlength="100"`, o mesmo limite do `max_length` do `Animal`. O campo para de aceitar letras no 100º caractere, então não precisa de mensagem, e o usuário não descobre o limite só depois de enviar uma foto de até 12 MB.

### Foto

Segue a observação do Patrick na issue #10:

- O backend aceita JPG, PNG e WebP. Os formatos aceitos aparecem escritos perto do campo.
- O campo deve ser `<input type="file" accept="image/jpeg,image/png,image/webp">`, e não `accept="image/*"`, para o iPhone converter a foto HEIC em JPEG ao enviar.
- Mensagens de erro previstas:
  - formato não aceito: "Este formato não é aceito. Envie a foto em JPG, PNG ou WebP."
  - arquivo que o Pillow não reconhece como imagem (vem do backend): "Não conseguimos abrir este arquivo como imagem. Tente outra foto."
- O botão de envio tem o estado **Enviando…**, travado para não cadastrar duas vezes, porque fotos de celular pesam de 3 a 12 MB.
- No celular o campo abre a câmera ou a galeria. No computador há uma área para arrastar a foto.
- O limite de tamanho e o redimensionamento da foto serão decididos na API (Fase 3).

## Interessados

- Aberta pelo botão **Interessados** de cada animal. Mostra um resumo do animal, com o mesmo controle Disponível / Adotado.
- As solicitações pendentes aparecem primeiro, com **Aceitar** e **Recusar**. Os status são os do modelo `solicitacoes.SolicitacaoAdocao`: pendente, aceita ou recusada.
- A data mostrada é a do `criado_em` da solicitação. A data da resposta não aparece, porque o modelo não guarda esse dado (o `atualizado_em` muda com qualquer alteração).
- O contato do adotante (email e telefone, se informado) só aparece depois que a solicitação é aceita.
- Filtros: Todas, Pendentes, Aceitas e Recusadas.

### Falha em Aceitar, Recusar e no controle de status

Valem para Aceitar e Recusar, em Interessados, e para o controle Disponível / Adotado, em Meus animais e em Interessados:

| Momento | O que acontece |
| :--- | :--- |
| Enquanto envia | O botão clicado fica travado, para um duplo clique não mandar duas vezes. |
| Se falhar (rede ou servidor) | Aviso de erro igual ao do painel G do `responsavel-05`: "Não foi possível salvar. Confira sua conexão e tente de novo." A tela volta ao status anterior. |

## Texto longo

O nome do animal e a cidade vão até 100 caracteres, e o nome do adotante e o do responsável até 150.

- Cartões, linhas de interessados e o nome no cabeçalho usam uma linha só, com reticências no fim.
- As características viram dois pares fixos nos cartões do celular e no resumo do animal em Interessados (computador e celular), como na #16: `[Espécie] · [Sexo]` numa linha e `[Idade] · [Porte]` na outra. Com dados reais, como "Cachorro · Fêmea · Menos de 1 ano · Pequeno", a linha única cortava o porte. Nos cartões de Meus animais no computador ela cabe, então fica numa linha só.
- Cada par e a linha da cidade seguem a mesma regra de uma linha com reticências.
- Títulos, como "Interessados em [Nome]", e avisos quebram linha.
- As etiquetas de status e os botões não encolhem: quem cede espaço é o texto.

## Acessibilidade

A borda dos controles usa `#857C70`, como na #14: campos, opções de rádio, botões Recusar e Editar, filtros, controle Disponível / Adotado, botão do lápis e tracejado da foto. Dá 4,1:1 no branco e 3,8:1 no fundo `#FAF7F2`, acima do mínimo de 3:1 (WCAG 1.4.11).
Cartões e divisórias continuam com `#E7E1D8`, porque não são controles.

Todo alvo de toque tem pelo menos 44 px de altura, como pede o estilo da #8: botões, campos, filtros, controle de status, os links do cabeçalho (Início, Meus animais e Solicitações), o logo e o **Desfazer** do aviso no computador, que ali é um botão à parte. No celular o **Desfazer** fica dentro da frase do aviso, como link de texto.

## Para o grupo decidir

- Aceitar ou recusar sem pedir confirmação, com **Desfazer** no aviso (como desenhado), ou abrir uma confirmação antes. Ponto do Guilherme: ao aceitar, o contato aparece na hora, e o Desfazer não apaga o que a outra pessoa já viu. A sugestão é confirmar antes de aceitar e deixar o Desfazer só para recusar.
- Se aceitar uma solicitação deve marcar o animal como adotado automaticamente. No desenho, o responsável marca à mão quando a adoção se concretiza.
- Se pode haver mais de uma solicitação aceita para o mesmo animal. Hoje as outras pendentes continuam com Aceitar.
- O que acontece com as pendentes quando o animal é marcado como adotado: viram recusadas ou continuam pendentes. A mesma pergunta vale para a #16, do lado do adotante.
- Para onde vai o item **Solicitações** do menu. Não há tela geral: as solicitações ficam em Interessados, por animal. Ou ele leva para Meus animais filtrado pelos que têm solicitação pendente, ou sai do menu.
- Excluir animal: nenhuma tela prevê. Se o requisito de animais pedir exclusão, falta desenhar.
- Limite de idade: o modelo aceita até 32767 anos. Ter ou não um limite é decisão do backend.
- Cidade e UF: o campo sugere "Ex.: Votuporanga – SP", e tudo vira texto livre no `cidade`. A #16 pediu um campo `uf` ao backend. Se ele entrar, o formulário ganha um campo de UF separado.
