# AdotaPet

Plataforma web para adoção responsável de animais: aproxima pessoas interessadas em adotar de responsáveis por animais disponíveis.

Projeto Integrado VIII – Engenharia de Computação, UNIFEV (Votuporanga – SP), 2026. Orientação: Prof. Dr. Fernando Kendy.

## Equipe

| Área | Integrantes |
| --- | --- |
| Backend (API, banco e Docker) | Patrick Ornelas, Dawid Rizzo, Gustavo Akihiro |
| Frontend (telas em React) | Guilherme Autulo, Fernando Tavares, Leonardo Gonçalves |
| Testes de software | Gabriel Movio |

## Andamento

| Fase | Entrega | Responsáveis | Situação |
| --- | --- | --- | --- |
| 0 | Estrutura, Docker e repositório | Patrick, Dawid, Gustavo (Django, Docker, banco) · Guilherme, Fernando, Leonardo (projeto React) · Gabriel (valida o README numa máquina limpa) | 🔄 Em validação |
| 1 | Modelo de dados | Patrick, Dawid, Gustavo · Gabriel (testes) | ⏳ |
| 2 | API de autenticação (RF01, RF02) | Patrick, Dawid, Gustavo · Gabriel (testes) | ⏳ |
| 3 | API de animais (RF03–RF08) | Patrick, Dawid, Gustavo · Gabriel (testes) | ⏳ |
| 4 | API de solicitações (RF09–RF11) | Patrick, Dawid, Gustavo · Gabriel (testes) | ⏳ |
| 5 | Base do frontend, login e cadastro | Guilherme, Fernando, Leonardo · backend no apoio · Gabriel (testes) | ⏳ |
| 6 | Telas do adotante | Guilherme, Fernando, Leonardo · Gabriel (testes) | ⏳ |
| 7 | Telas do responsável | Guilherme, Fernando, Leonardo · Gabriel (testes) | ⏳ |
| 8 | Qualidade: responsividade, acessibilidade, usabilidade | Gabriel (lidera) · todos | ⏳ |
| 9 | Entrega final | Todos | ⏳ |

Durante as fases 1 a 4, o time de frontend desenha os wireframes das telas.

## Tecnologias

- **Backend:** Python 3.12, Django 5.2, Django REST Framework, JWT (simplejwt)
- **Frontend:** React 19 com Vite
- **Banco:** PostgreSQL 17
- **Ambiente:** Docker e Docker Compose (todos rodam as mesmas versões)

## Como rodar

Pré-requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) e [Git](https://git-scm.com/). Não precisa instalar Python, Node nem PostgreSQL: eles rodam dentro dos containers.

```bash
git clone https://github.com/<usuario>/adotapet.git
cd adotapet
cp .env.example .env        # no Windows (PowerShell): copy .env.example .env
docker compose up --build
```

A primeira vez demora alguns minutos (baixa as imagens e instala as dependências). Depois, abra:

| Endereço | O que é |
| --- | --- |
| http://localhost:5173 | Site (React). A página da Fase 0 mostra se API e banco estão ok |
| http://localhost:8000/api/health/ | Verificação da API |
| http://localhost:8000/admin/ | Painel administrativo do Django |

Ao salvar um arquivo, o servidor recarrega sozinho; não precisa reiniciar os containers.

### Comandos do dia a dia

Rode em outro terminal, com os containers ligados:

```bash
# Criar um usuário administrador (para entrar em /admin)
docker compose exec backend python manage.py createsuperuser

# Criar e aplicar migrações depois de mudar um model
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Rodar os testes do backend
docker compose exec backend python manage.py test

# Instalar um pacote no frontend (atualiza package.json e package-lock.json)
docker compose exec frontend npm install <pacote>

# Ver os logs de um serviço
docker compose logs -f backend

# Desligar tudo (os dados do banco continuam salvos)
docker compose down

# Desligar e APAGAR o banco (começar do zero)
docker compose down -v
```

Ao adicionar um pacote Python, coloque-o no `backend/requirements.txt` com a versão fixa e rode `docker compose up --build`.

## Estrutura

```
adotapet/
├── backend/              API em Django
│   ├── config/           configurações e rotas principais
│   ├── core/             base comum (ModeloBase com UUID, /api/health/)
│   ├── usuarios/         usuários e autenticação
│   └── Dockerfile
├── frontend/             site em React (Vite)
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml    sobe banco, backend e frontend juntos
└── .env.example          modelo das variáveis de ambiente
```

Todos os modelos herdam de `core.models.ModeloBase`, que usa UUID como chave primária (RNF07).

## Como contribuir

### Branches

- `main`: versão estável, usada nas apresentações. Ninguém faz commit direto nela.
- `develop`: onde as tarefas se juntam.
- `feature/<tarefa>`: uma branch por tarefa, criada a partir da `develop` (ex.: `feature/api-animais`).

```bash
git checkout develop
git pull
git checkout -b feature/minha-tarefa
# ... trabalha, faz commits ...
git push -u origin feature/minha-tarefa
```

Depois abra um Pull Request para a `develop` no GitHub. O modelo do PR já vem preenchido com um checklist. Pelo menos 1 integrante precisa aprovar. Ao fim de cada fase, a `develop` é integrada na `main`.

### Mensagens de commit

Curtas, no imperativo, com prefixo:

- `feat:` nova funcionalidade (`feat: cria rota de cadastro de animais`)
- `fix:` correção (`fix: corrige filtro por cidade`)
- `test:` testes (`test: cobre permissão de edição de animal`)
- `docs:` documentação (`docs: atualiza README`)
- `chore:` configuração e manutenção (`chore: atualiza dependências`)

### Problemas comuns

- **Porta já em uso (5432, 8000 ou 5173):** outro programa está usando a porta. Feche-o (por exemplo, um PostgreSQL instalado na máquina) ou troque a porta da esquerda no `docker-compose.yml`.
- **Mudei o `requirements.txt` ou o `package.json` e não funcionou:** rode `docker compose up --build`.
- **A página não recarrega ao salvar (Windows):** confira se o projeto está numa pasta do WSL ou se o Docker Desktop tem acesso à pasta.
