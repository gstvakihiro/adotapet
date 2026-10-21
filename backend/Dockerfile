# Imagem do backend (Django + DRF) para desenvolvimento.
FROM python:3.12-slim

# Sem arquivos .pyc e com logs aparecendo na hora no terminal
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instala as dependências primeiro, para o Docker reaproveitar essa camada
# quando só o código mudar.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Aplica as migrações e sobe o servidor de desenvolvimento
# (recarrega sozinho ao salvar um arquivo).
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
