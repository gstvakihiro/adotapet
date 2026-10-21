<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/marca/GenA-logo-azul-fundo-escuro.png">
  <source media="(prefers-color-scheme: light)" srcset="docs/marca/GenA-logo-azul-fundo-claro.png">
  <img alt="GenA" src="docs/marca/GenA-logo-azul-fundo-claro.png" width="320">
</picture>

### Sistema web de pedidos para padaria

Lance os pedidos por horário, empresa e cliente, veja o que produzir e acompanhe vendas, lucro e rotas de entrega.

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-1f7aff?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-1f7aff?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-1f7aff?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-1f7aff?style=for-the-badge&logo=supabase&logoColor=white)

</div>

---

## 📖 Sobre o projeto

O **GenA** substitui a folha A3 em que os pedidos de uma padaria eram anotados à mão. Os pedidos chegam pelo WhatsApp, são organizados **por empresa** (fábricas e comércios), separados por **cliente** (as pessoas de cada empresa) e entregues em um de três horários: **08:00, 14:00 e 15:30**.

```
Empresa X
 ├─ Cliente 1   →  lanche, bebida
 └─ Cliente 2   →  lanche, bolacha
```

É uma aplicação web, aberta direto no navegador, sem instalar nada. Funciona no celular, no tablet e no computador.

## ✨ Funcionalidades

| | Funcionalidade | Situação |
|---|---|---|
| 🔐 | Login com e-mail e senha | ✅ Pronto |
| 🏷️ | **Catálogo** de itens por categoria, com preço de venda e custo, por unidade ou por kg | ✅ Pronto |
| 🏭 | **Empresas** (fábricas e comércios) com endereço | ✅ Pronto |
| 👥 | **Clientes**, as pessoas de cada empresa | ✅ Pronto |
| 📋 | **Pedidos** por data, horário, empresa e cliente | 🔜 Próxima fase |
| 🧾 | Resumo de **produção** por horário | 🔜 Próxima fase |
| 💳 | Forma de pagamento (PIX, dinheiro ou notinha) e lista de **a receber** | 🔜 Planejado |
| 📊 | **Dashboard** de vendas e lucro, por semana e por mês | 🔜 Planejado |
| 🗺️ | **Mapa** com a melhor rota de entrega de cada horário | 🔜 Planejado |

Itens por quilo (como bolacha) são lançados pelo **valor que saiu na balança**, e o sistema calcula o peso aproximado.

## 🧭 Andamento

- [x] **Fase 0** · Preparação
- [x] **Fase 1** · Projeto base e visual (menu lateral, tema claro e escuro, logo)
- [x] **Fase 2** · Banco de dados e login
- [x] **Fase 3** · Cadastros (catálogo, empresas e clientes)
- [ ] **Fase 4** · Lançamento de pedidos
- [ ] **Fase 5** · Dashboard
- [ ] **Fase 6** · Mapa e rota de entrega
- [ ] **Fase 7** · Testes com uso real e publicação

O plano completo está em [`docs/plano-de-desenvolvimento.pdf`](docs/plano-de-desenvolvimento.pdf).

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Site | [Next.js](https://nextjs.org) (App Router), [React](https://react.dev) e [TypeScript](https://www.typescriptlang.org) |
| Estilo | [Tailwind CSS](https://tailwindcss.com) e CSS próprio, com modo claro e escuro |
| Banco de dados e login | [Supabase](https://supabase.com) (PostgreSQL com controle de acesso por linha) |
| Mapa e rota *(planejado)* | Mapcn (MapLibre) e OpenRouteService |

## 🚀 Como rodar no seu computador

Precisa do [Node.js](https://nodejs.org) (versão LTS) e do [Git](https://git-scm.com).

**1. Instale as dependências**

```bash
npm install
```

**2. Configure o acesso ao Supabase**

Copie o arquivo de exemplo e preencha com os dados do seu projeto (painel do Supabase, botão **Connect**):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

**3. Crie as tabelas**

No **SQL Editor** do Supabase, rode os arquivos de `supabase/migrations/` **na ordem**, uma vez cada:

1. `0001_tabelas_iniciais.sql`
2. `0002_empresas_e_clientes.sql`

**4. Crie o usuário de acesso**

No painel do Supabase, em **Authentication → Users**, use **Add user**. O cadastro aberto deve ficar **desligado**, para que só quem você criar consiga entrar.

**5. Ligue o site**

```bash
npm run dev
```

Abra <http://localhost:3000>.

## 🗂️ Estrutura do projeto

```
app/                    páginas: pedidos, dashboard, catalogo, empresas, clientes, login
components/             menu lateral, ícones e peças reutilizáveis
lib/supabase/           conexão com o Supabase (navegador, servidor e proteção de páginas)
public/                 logos e fundo, nas versões clara e escura
supabase/migrations/    scripts SQL das tabelas, em ordem
docs/                   plano de desenvolvimento, protótipo visual e logos originais
```

## 🔒 Segurança

- Todas as tabelas têm **RLS** (controle de acesso por linha) ativado: só usuários logados leem ou alteram os dados.
- Quem não está logado é levado para a tela de entrada.
- **Nunca** suba senhas ou chaves para o GitHub. Elas ficam no `.env.local`, que já é ignorado pelo Git, e nas variáveis de ambiente da hospedagem.
- A chave `service_role` do Supabase nunca é usada no navegador.

## 📚 Documentação

- [Plano de desenvolvimento](docs/plano-de-desenvolvimento.pdf): fases, modelo de dados, custos e decisões
- [Protótipo clicável](docs/prototipo/prototipo-gena.html): abra no navegador para ver o visual e as regras de referência
- [Logos](docs/marca): versões para fundo claro e escuro

---

<div align="center">

Feito para a padaria da família, em Valentim Gentil - SP. 🥖

</div>
