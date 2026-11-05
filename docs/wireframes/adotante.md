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
| `adotante-07-detalhe-estados.png` | Estados do botão Tenho interesse: sem login, enviando, enviado e ao voltar depois |
| `adotante-08-vazios-computador.png` · `adotante-09-vazios-celular.png` | Animais sem resultado e Minhas solicitações sem nenhuma solicitação |

Textos entre colchetes, como `[Nome]`, são espaços para dados reais.

## Animais para adoção

- Os filtros de espécie (Cachorro, Gato, Outro), sexo (Macho, Fêmea) e porte (Pequeno, Médio, Grande) são as `choices` do modelo `animais.Animal`.
- A idade aparece em faixas sobre o campo inteiro `idade`: Filhote (0, menos de 1 ano), Jovem (1 a 3 anos), Adulto (4 a 7 anos) e Idoso (8 anos ou mais).
- A cidade é uma lista de seleção.
- No computador, os filtros ficam numa coluna ao lado dos cartões. No celular, abrem num painel pelo botão **Filtros (N)**, em que N é o número de opções marcadas, e o painel termina com **Limpar** e **Ver [N] animais**.
- O cartão abre o detalhe do animal.

### Sem resultado

"Nenhum animal encontrado", com "Tente tirar algum filtro ou escolher outra cidade." e o botão **Limpar filtros**, que desmarca tudo e volta à lista completa. Os filtros continuam à vista.

## Detalhe do animal

- Mostra a foto, o nome, a cidade, a espécie, o sexo, a idade, o porte, a descrição e o nome do responsável.
- O contato do responsável não aparece aqui: só em Minhas solicitações, depois que a solicitação é aceita.

### Botão Tenho interesse (`adotante-07`)

| Situação | O que aparece |
| :--- | :--- |
| Visitante sem login | O aviso "Você precisa entrar para demonstrar interesse." acima do botão. O botão leva ao login e, depois de entrar, a pessoa volta para o mesmo animal. O cabeçalho é o sem login da #14. |
| Adotante sem solicitação para o animal | O botão **Tenho interesse**. |
| Enviando | O botão **Enviando…**, travado até a resposta do servidor, para não enviar a mesma solicitação duas vezes. |
| Logo depois de enviar | O aviso verde "Interesse enviado. O responsável vai responder em Minhas solicitações." e, no lugar do botão, "Interesse enviado · Pendente" com o link **Ver em Minhas solicitações**. |
| Ao voltar com a solicitação pendente | "Interesse enviado · Pendente" com o link, sem o aviso. |

O modelo `solicitacoes.SolicitacaoAdocao` aceita só uma solicitação por adotante e animal (a `UniqueConstraint` da #17). Por isso o botão não volta depois do envio.

## Minhas solicitações

- Uma linha por solicitação, da mais nova para a mais antiga (`ordering = ["-criado_em"]`).
- Os status são os do modelo `solicitacoes.SolicitacaoAdocao`: Pendente, Aceita e Recusada. Cada selo tem ícone e texto, não só cor.
- "Enviada em [dd/mm/aaaa]" é o `criado_em` da solicitação, com o mesmo texto no computador e no celular.
- A solicitação aceita mostra o contato do responsável: email e telefone. O telefone é opcional no `usuarios.Usuario` (`blank=True`); sem telefone, aparece só o email, sem o "·".
- Filtros: Todas, Pendentes, Aceitas e Recusadas, com a contagem de cada um.
- O nome do animal abre o detalhe.

### Sem nenhuma solicitação

"Você ainda não demonstrou interesse em nenhum animal", com uma explicação e o botão **Ver animais para adoção**. Os filtros de status não aparecem.

## Formato dos dados

| Campo | Como aparece |
| :--- | :--- |
| Idade (`idade`, inteiro) | 0 aparece como "Menos de 1 ano", 1 como "1 ano" e 2 ou mais como "[N] anos" |
| Cidade | "[Cidade – UF]", como nas telas da #14 e da #15. O modelo só tem `cidade`; o campo `uf` está pedido ao backend (abaixo) |
| Telefone do responsável | Só quando informado |

## Texto longo

O nome do animal e a cidade vão até 100 caracteres, o nome do responsável até 150, e a descrição não tem limite.

- Cartões e linhas de Minhas solicitações: o nome, as características (`[Espécie] · [Sexo] · [Idade] · [Porte]`) e a cidade ficam numa linha só, com reticências no fim. É a mesma regra do `responsavel.md` (#15). O primeiro cartão de cada tela mostra um nome longo cortado.
- Detalhe do animal: o nome, o nome do responsável e a descrição quebram linha normalmente; nada é cortado.
- Os selos de status e os botões não encolhem: quem cede espaço é o texto.

## Acessibilidade

A borda dos controles usa `#857C70`, como na #14: campo de cidade, filtros do celular, filtros de status e botão da conta. Dá 4,1:1 no branco e 3,8:1 no fundo `#FAF7F2`, acima do mínimo de 3:1 (WCAG 1.4.11).
Cartões e divisórias continuam com `#E7E1D8`, porque não são controles.

## Perguntas para o backend

- Criar o campo `uf` no `Animal` antes da API de animais, para as telas mostrarem "[Cidade – UF]".
- Quando o responsável marca um animal como adotado, o que acontece com as solicitações pendentes das outras pessoas: viram recusadas ou ficam pendentes? (mesma pergunta da #15)
- O adotante pode desistir de uma solicitação pendente? O modelo da #17 não tem o status cancelada.
- Filtros com várias opções marcadas: dentro do mesmo grupo vale "ou" e entre grupos vale "e"? E de onde vem a lista de cidades, se `cidade` é texto livre ("São Paulo" e "sao paulo" viram duas opções)?
- A listagem terá paginação ou rolagem infinita?

## Para o grupo decidir

- O que o detalhe mostra quando a solicitação já foi aceita ou recusada. Só o caso pendente está desenhado.
