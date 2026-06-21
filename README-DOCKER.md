# 🐳 Guia Docker para App Fitness - PostgreSQL

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Como Usar](#como-usar)
4. [Comandos Úteis](#comandos-úteis)
5. [Estrutura dos Arquivos](#estrutura-dos-arquivos)
6. [Troubleshooting](#troubleshooting)
7. [Boas Práticas em Produção](#boas-práticas-em-produção)

---

## Visão Geral

Esta solução Docker fornece:
- **PostgreSQL 16 Alpine**: Versão estável, leve e otimizada
- **Inicialização Automática**: Cria tabelas e dados de exemplo
- **Persistência de Dados**: Volume nomeado para dados duráveis
- **Health Check**: Verifica se o banco está pronto
- **Isolamento em Rede**: Comunicação segura entre containers
- **Logging Estruturado**: Controle de logs em JSON

---

## Pré-requisitos

### Windows
```bash
# Instale Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop

# Verifique a instalação
docker --version
docker-compose --version
```

### Verificar Docker
```cmd
docker ps
docker-compose --version
```

---

## Como Usar

### 1️⃣ Primeiro Setup - Criar o Arquivo `.env`

```cmd
# Copie o arquivo de exemplo
copy .env.example .env

# Edite o arquivo .env e altere a senha padrão
# POSTGRES_PASSWORD=sua_senha_super_segura
```

### 2️⃣ Iniciar o PostgreSQL

```cmd
# Construir e iniciar o container em background
docker-compose up -d

# Acompanhar o build e inicialização
docker-compose up

# Parar o container
docker-compose down
```

### 3️⃣ Verificar Status

```cmd
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f postgres

# Ver apenas erros
docker-compose logs postgres | findstr "ERROR"
```

### 4️⃣ Conectar ao Banco de Dados

#### Usando `psql` via Docker
```cmd
# Acessar o shell do PostgreSQL
docker-compose exec postgres psql -U appfitness_user -d appfitness_db

# Comandos básicos no psql:
# \dt              - listar tabelas
# \d usuario       - descrever tabela 'usuario'
# SELECT * FROM usuario; - ver dados
# \q              - sair
```

#### Usando Ferramenta Gráfica (DBeaver, pgAdmin, etc.)
```
Host:     localhost
Porta:    5432
Database: appfitness_db
Usuário:  appfitness_user
Senha:    (conforme definido em .env)
```

---

## Comandos Úteis

### 🔍 Diagnóstico

```cmd
# Ver informações completas do container
docker-compose ps -a

# Ver logs detalhados
docker-compose logs postgres

# Ver quanto tempo leva para o banco estar pronto
docker-compose logs postgres | findstr "ready to accept"

# Inspecionar variáveis do container
docker-compose exec postgres env | findstr POSTGRES
```

### 💾 Gerenciamento de Dados

```cmd
# Fazer backup do banco
docker-compose exec postgres pg_dump -U appfitness_user appfitness_db > backup.sql

# Restaurar de um backup
docker-compose exec -T postgres psql -U appfitness_user appfitness_db < backup.sql

# Limpar tudo (cuidado!)
docker-compose down -v

# Apenas parar sem remover volumes
docker-compose stop
```

### 🔧 Troubleshooting

```cmd
# Reiniciar o container
docker-compose restart postgres

# Remover e recriar do zero
docker-compose down -v && docker-compose up -d

# Ver espaço em disco utilizado
docker system df

# Limpar recursos não utilizados
docker system prune -a
```

---

## Estrutura dos Arquivos

```
app_fitness-main/
│
├── Dockerfile                          # Definição da imagem PostgreSQL
│
├── docker-compose.yml                  # Orquestração dos containers
│
├── .env.example                        # Modelo de variáveis de ambiente
│
├── .env                                # Variáveis reais (NÃO versionar!)
│
└── docker-entrypoint-initdb.d/
    └── 01-init-db.sql                  # Script SQL de inicialização
```

### Arquivo: `Dockerfile`
- Define a imagem PostgreSQL 16 Alpine
- Configura variáveis de ambiente
- Define volumes e portas
- Configura health check

### Arquivo: `docker-compose.yml`
- Orquestra o container PostgreSQL
- Mapeia volumes
- Expõe portas
- Configurar redes e logging

### Arquivo: `01-init-db.sql`
- Cria tabelas do banco de dados
- Insere dados de exemplo
- Cria índices para otimização

---

## Configuração do Spring Boot

Para conectar sua aplicação Spring Boot ao PostgreSQL no Docker:

### 1. Edite `application.properties`:

```properties
# PostgreSQL Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/appfitness_db
spring.datasource.username=appfitness_user
spring.datasource.password=appfitness_secure_password_123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

### 2. Adicione dependência `pom.xml` (se ainda não tiver):

```xml
<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>
```

---

## Troubleshooting

### ❌ Erro: "Container exits with code 1"

```cmd
# Veja os logs
docker-compose logs postgres

# Possível causa: Porta 5432 já em uso
# Solução: Mude a porta em docker-compose.yml
# ports:
#   - "5433:5432"
```

### ❌ Erro: "Permission denied while trying to connect to Docker daemon"

**Windows**: Reinicie o Docker Desktop ou adicione seu usuário ao grupo `docker`

### ❌ Erro: "Database is locked" durante testes

```cmd
# Termine todas as conexões
docker-compose exec postgres psql -U appfitness_user appfitness_db -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='appfitness_db';"

# Recrie o banco
docker-compose down -v && docker-compose up -d
```

### ❌ Erro: "Password authentication failed"

Verifique se as credenciais em `.env` correspondem ao `docker-compose.yml`

```cmd
# Veja as variáveis do container
docker-compose config
```

---

## Boas Práticas em Produção

### 🔐 Segurança

```bash
# 1. Nunca use senhas padrão - use senhas fortes
POSTGRES_PASSWORD=gH7k@mP2xQ9wL!vN5bC8dF

# 2. Use segredos do Docker em swarm
# docker secret create db_password -

# 3. Restrinja acesso às portas
# ports:
#   - "127.0.0.1:5432:5432"  # Apenas localhost

# 4. Use arquivos .env no .gitignore
echo ".env" >> .gitignore
echo "postgres_data/" >> .gitignore
```

### 📦 Otimização

```yaml
# Limite recursos no docker-compose.yml
services:
  postgres:
    # ... outros configs ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 📊 Monitoramento

```bash
# Use docker stats para monitorar
docker stats appfitness-postgres

# Configure alertas baseado em logs
docker-compose logs postgres | grep "ERROR"
```

### 🔄 Backups Automáticos

Crie um script `backup.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U appfitness_user appfitness_db \
  > backups/backup_$TIMESTAMP.sql
```

---

## 📚 Referências

- [Docker Official PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Spring Boot with PostgreSQL](https://spring.io/guides/gs/accessing-data-postgresql/)

---

## 🤝 Suporte

Para dúvidas ou problemas:
1. Veja os logs: `docker-compose logs -f postgres`
2. Verifique o `.env` está configurado corretamente
3. Confirme que a porta 5432 não está em uso
4. Reinicie: `docker-compose down && docker-compose up -d`

---

**Última atualização**: 2024 | **Versão Docker Compose**: 3.8 | **PostgreSQL**: 16 Alpine
