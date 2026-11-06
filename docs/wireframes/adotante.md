# Wireframes · Telas do adotante

Telas da issue #9, desenhadas no artefato de Design do Claude:
<https://claude.ai/artifact/GD44QNBsxDqv1iNL1kLo4V>

Seguem o estilo visual da issue #8 (cores, fontes Nunito e Inter, botões, campos, cartão de animal e avisos).
Cada tela tem versão para computador (1280 px) e celular (390 px), conforme o RNF01.

| Arquivo | Tela |
| :--- | :--- |
| `adotante-01-animais-computador.png` · `adotante-02-animais-celular.png` | Animais para adoção em cartões, com filtros por espécie, sexo, idade, porte e cidade |
| `adotante-03-detalhe-computador.png` · `adotante-04-detalhe-celular.png` | Detalhe do animal, com o botão Tenho interesse |
| `adotante-05-solicitacoes-computador.png` · `adotante-06-solicitacoes-celular.png` | Minhas solicitações, com o status de cada solicitação |
| `adotante-07-detalhe-estados.png` | Estados do botão Tenho interesse: sem login, enviando, enviado, pendente, aceita, recusada, falha no envio, animal adotado e responsável logado |
| `adotante-08-vazios-computador.png` · `adotante-09-vazios-celular.png` | Animais sem resultado, Minhas solicitações sem nenhuma solicitação e filtro de status sem resultado |

Textos entre colchetes, como `[Nome]`, são espaços para dados reais.

## Animais para adoção

- Os filtros de espécie (Cachorro, Gato, Outro), sexo (Macho, Fêmea) e porte (Pequeno, Médio, Grande) são as `choices` do modelo `animais.Animal`.
- A idade aparece em faixas sobre o campo inteiro `idade`: Filhote (0, menos de 1 ano), Jovem (1 a 3 anos), Adulto (4 a 7 anos) e Idoso (8 anos ou mais).
- A cidade é uma lista de seleção.
- No computador, os filtros ficam numa coluna ao lado dos cartões. No celular, abrem num painel pelo botão **Filtros (N)**, em que N conta as opções marcadas e a cidade, quando escolhida, e o painel termina com **Limpar** e **Ver [N] animais**.
- O cartão abre o detalhe do animal.

### Sem resultado

"Nenhum animal encontrado", com "Tente tirar algum filtro ou escolher outra cidade." e o botão **Limpar filtros**, que desmarca tudo e volta à lista completa. Os filtros continuam à vista.

## Detalhe do animal

- Mostra a foto, o nome, a cidade, a espécie, o sexo, a idade, o porte, a descrição e o nome do responsável.
- O contato do responsável não aparece aqui: só em Minhas solicitações, depois que a solicitação é aceita.

### Botão Tenho interesse (`adotante-07`)

| Situação | O que aparece |
| :--- | :--- |
| A · Visitante sem login | O aviso "Você precisa entrar para demonstrar interesse." acima do botão. O botão leva ao login e, depois de entrar, a pessoa volta para o mesmo animal. O cabeçalho é o sem login da #14. |
| Adotante sem solicitação para o animal | O botão **Tenho interesse**. |
| B · Enviando | O botão **Enviando…**, travado até a resposta do servidor, para não enviar a mesma solicitação duas vezes. |
| C · Logo depois de enviar | O aviso verde "Interesse enviado. O responsável vai responder em Minhas solicitações." e, no lugar do botão, "Interesse enviado · Pendente" com o link **Ver em Minhas solicitações**. |
| D · Ao voltar, solicitação pendente | "Interesse enviado · Pendente" com o link, sem o aviso. |
| E · Ao voltar, solicitação aceita | "Interesse enviado · Aceita" com o link **Ver o contato em Minhas solicitações**. |
| F · Ao voltar, solicitação recusada | "Interesse enviado · Recusada" com o link **Ver em Minhas solicitações**. |
| G · Envio falhou (rede ou servidor) | O aviso "Não foi possível enviar. Confira sua conexão e tente de novo." e o botão de volta, como no cadastro de animal da #15. |
| H · Animal adotado durante o envio | O aviso "Não foi possível enviar: este animal acabou de ser adotado." e o selo **Adotado** com "Este animal já foi adotado.", sem o botão. |
| I · Animal já adotado | O selo **Adotado** com "Este animal já foi adotado.", sem o botão. Aparece quando o detalhe é aberto por Minhas solicitações ou por um link antigo: o animal saiu da busca e não recebe solicitações (#6). |
| J · Responsável logado | "Só contas de adotante podem demonstrar interesse.", sem o botão. O cabeçalho é o do responsável, da #14. |

O modelo `solicitacoes.SolicitacaoAdocao` aceita só uma solicitação por adotante e animal (a `UniqueConstraint` da #17) e recusa solicitação de quem não é adotante (o `clean`). Por isso o botão não volta depois do envio e não aparece para o responsável.

## Minhas solicitações

- Uma linha por solicitação, da mais nova para a mais antiga (`ordering = ["-criado_em"]`).
- Os status são os do modelo `solicitacoes.SolicitacaoAdocao`: Pendente, Aceita e Recusada. Cada selo tem ícone e texto, não só cor.
- "Enviada em [dd/mm/aaaa]" é o `criado_em` da solicitação, com o mesmo texto no computador e no celular.
- A solicitação aceita mostra o contato do responsável: email e telefone. O telefone é opcional no `usuarios.Usuario` (`blank=True`); sem telefone, aparece só o email, sem o "·".
- Filtros: Todas, Pendentes, Aceitas e Recusadas, com a contagem de cada um.
- O nome do animal abre o detalhe.

### Sem nenhuma solicitação

"Você ainda não demonstrou interesse em nenhum animal", com uma explicação e o botão **Ver animais para adoção**. Os filtros de status não aparecem.

### Filtro de status sem resultado

Os filtros continuam à vista e, no lugar da lista, aparece "Nenhuma solicitação pendente", "Nenhuma solicitação aceita" ou "Nenhuma solicitação recusada", com o botão **Ver todas**, como em Interessados da #15.

## Formato dos dados

| Campo | Como aparece |
| :--- | :--- |
| Idade (`idade`, inteiro) | 0 aparece como "Menos de 1 ano", 1 como "1 ano" e 2 ou mais como "[N] anos" |
| Cidade | "[Cidade – UF]", como nas telas da #14 e da #15. O modelo só tem `cidade`; o campo `uf` está pedido ao backend (abaixo) |
| Telefone do responsável | Só quando informado |

## Texto longo

O nome do animal e a cidade vão até 100 caracteres, o nome do responsável até 150, e a descrição não tem limite.

- Cartões de animal (computador e celular) e Minhas solicitações no celular: as características ficam em dois pares fixos, "[Espécie] · [Sexo]" numa linha e "[Idade] · [Porte]" na outra. Assim a idade e o porte, que são filtros da tela, nunca são cortados, e o "·" não fica sozinho no fim da linha.
- Minhas solicitações no computador: as características e a cidade ficam numa linha, que cabe com dados reais; só uma cidade longa é cortada com reticências.
- O nome do animal e a cidade ficam numa linha só, com reticências no fim. O primeiro cartão de cada lista mostra um nome longo cortado.
- Detalhe do animal: o nome, o nome do responsável e a descrição quebram linha com `overflow-wrap: anywhere`, para que um link longo colado na descrição (por exemplo, de Instagram) não alargue a página. Nada é cortado.
- Os selos de status e os botões não encolhem: quem cede espaço é o texto.

## Acessibilidade

A borda dos controles usa `#857C70`, como na #14: campo de cidade, filtros do celular, filtros de status e botão da conta. Dá 4,1:1 no branco e 3,8:1 no fundo `#FAF7F2`, acima do mínimo de 3:1 (WCAG 1.4.11).
Cartões e divisórias continuam com `#E7E1D8`, porque não são controles.

Todo controle tem área de toque de pelo menos 44 px, como pede o estilo da #8: botões, filtros, opções com caixa de seleção, o logo e o nome do animal em Minhas solicitações.
No detalhe, a foto do responsável e o ícone da cidade não encolhem quando o texto ao lado é longo.

## Perguntas para o backend

- Criar o campo `uf` no `Animal` antes da API de animais, para as telas mostrarem "[Cidade – UF]".
- Quando o responsável marca um animal como adotado, o que acontece com as solicitações pendentes das outras pessoas: viram recusadas ou ficam pendentes? (mesma pergunta da #15)
- O adotante pode desistir de uma solicitação pendente? O modelo da #17 não tem o status cancelada.
- Filtros com várias opções marcadas: dentro do mesmo grupo vale "ou" e entre grupos vale "e"? E de onde vem a lista de cidades, se `cidade` é texto livre ("São Paulo" e "sao paulo" viram duas opções)?
- A listagem terá paginação ou rolagem infinita?
