FROM python:3.12-slim

WORKDIR /app

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer requirements
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt


COPY . .

EXPOSE 8000
