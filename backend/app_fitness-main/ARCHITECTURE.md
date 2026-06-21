# 🏗️ Arquitetura Docker - App Fitness

## Diagrama da Solução

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MÁQUINA DO DESENVOLVEDOR                         │
│                     (Windows/Linux/macOS)                           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌─────────────────────┐  ┌──────────────────────┐
        │  Aplicação Spring   │  │  Docker Engine       │
        │       Boot          │  │  (Docker Desktop)    │
        │                     │  │                      │
        │  http://localhost   │  │  - Containers        │
        │  :8080              │  │  - Volumes           │
        │                     │  │  - Networks          │
        └────────────┬────────┘  └──────────────┬───────┘
                     │                          │
                     │         jdbc:postgresql://localhost:5432
                     │                          │
                     └──────────────┬───────────┘
                                    │
        ┌───────────────────────────┴───────────────────────┐
        │  Docker Network: appfitness-network              │
        │  (Bridge - Isolamento de Rede)                   │
        └───────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
                ▼                                       ▼
    ┌─────────────────────────┐         ┌──────────────────────┐
    │  Container: postgres    │         │  Docker Volumes      │
    │  (PostgreSQL 16)        │         │  (Persistência)      │
    │                         │         │                      │
    │  ┌─────────────────┐    │         │ ┌────────────────┐  │
    │  │  Dockerfile     │    │         │ │ postgres_data/ │  │
    │  │  - FROM postgres    │         │ │ (dados do DB)  │  │
    │  │  - ENV config   │    │         │ └────────────────┘  │
    │  │  - VOLUME setup │    │         │                      │
    │  │  - EXPOSE 5432  │    │         │ ┌────────────────┐  │
    │  │  - HEALTHCHECK  │    │         │ │ postgres_logs/ │  │
    │  └─────────────────┘    │         │ │ (logs)         │  │
    │                         │         │ └────────────────┘  │
    │  ┌─────────────────┐    │         │                      │
    │  │  Porta 5432     │◄───┼─────────►                      │
    │  │  (TCP Listen)   │    │         │                      │
    │  └─────────────────┘    │         │                      │
    │                         │         │                      │
    │  ┌─────────────────┐    │         │                      │
    │  │ init-script     │    │         │                      │
    │  │ (01-init-db.sql)│    │         │                      │
    │  │ - Cria tabelas  │    │         │                      │
    │  │ - Índices       │    │         │                      │
    │  │ - Dados ex.     │    │         │                      │
    │  └─────────────────┘    │         │                      │
    │                         │         │                      │
    │  ┌─────────────────┐    │         │                      │
    │  │ Health Check    │    │         │                      │
    │  │ pg_isready      │    │         │                      │
    │  │ (a cada 10s)    │    │         │                      │
    │  └─────────────────┘    │         │                      │
    │                         │         │                      │
    └─────────────────────────┘         └──────────────────────┘
```

---

## 📦 Fluxo de Inicialização

```
1. docker-compose up -d
   │
   ├─► Lê docker-compose.yml
   │
   ├─► Build Dockerfile (primeira vez)
   │   ├─► FROM postgres:16-alpine
   │   ├─► SET ENVs (DB, USER, PASSWORD)
   │   ├─► COPY scripts SQL
   │   ├─► SET VOLUME mount point
   │   └─► SET HEALTHCHECK
   │
   ├─► Cria Volume postgres_data
   │
   ├─► Cria Rede appfitness-network
   │
   ├─► Inicia Container
   │   ├─► init-script (01-init-db.sql)
   │   │   ├─► CREATE TABLE usuario
   │   │   ├─► CREATE TABLE exercicio
   │   │   ├─► CREATE TABLE treino
   │   │   ├─► CREATE TABLE dieta
   │   │   ├─► INSERT dados exemplo
   │   │   └─► CREATE INDEXes
   │   │
   │   ├─► Aguarda ~30-40s
   │   │
   │   ├─► Health Check
   │   │   └─► pg_isready → ✅ HEALTHY
   │   │
   │   └─► Ready para conexões
   │
   └─► ✅ PostgreSQL pronto!
```

---

## 🔄 Ciclo de Vida do Container

```
┌─────────┐      docker-compose up      ┌────────┐
│ STOPPED │─────────────────────────────►│ RUNNING│
│  (OFF)  │                              │  (ON)  │
└─────────┘◄─────────────────────────────┴────────┘
    ▲         docker-compose down              │
    │                                           │
    │                                           │
    │         docker-compose restart            │
    │         ├─ stop (graceful)                │
    │         └─ start                          │
    │                                           │
    │         RESTART POLICY                    │
    │         unless-stopped                    │
    │         (reinicia se travar)              │
    │                                           │
    └───────────────────────────────────────────┘
```

---

## 📊 Estrutura de Dados

```
┌───────────────────────────────────────────────────────┐
│              DATABASE: appfitness_db                  │
└───────────────────────────────────────────────────────┘
                        │
        ┌───────┬───────┼───────┬─────────┐
        │       │       │       │         │
        ▼       ▼       ▼       ▼         ▼
    ┌─────┐ ┌────────┐ ┌──────┐ ┌───────┐ ┌──────┐
    │uuid │ │usuario │ │exerc.│ │treino │ │dieta │
    │ext. │ └────────┘ └──────┘ └───────┘ └──────┘
    └─────┘      │         │        │        │
                 │         │        │        │
                 ├─►índices ├─►indices├►indices
                 │         │        │        │
                 email  group_m   user_id  user_id
```

---

## 🔐 Segurança em Camadas

```
Camada 1: Sistema Operacional
├─ Isolamento de container
├─ Namespace Linux
└─ Control Groups (cgroups)

Camada 2: Docker
├─ Rede isolada (bridge)
├─ Volumes limitados
└─ Permissões de arquivo

Camada 3: PostgreSQL
├─ Autenticação (usuário/senha)
├─ Banco separado (appfitness_db)
└─ Usuário sem privilégios de SO

Camada 4: Aplicação
├─ Variáveis de ambiente (.env)
├─ Credenciais não hardcoded
└─ Conexão criptografada (opcional)

Camada 5: Operação
├─ Health checks
├─ Logs auditáveis
└─ Backups automáticos
```

---

## 📈 Performance & Escalabilidade

```
┌──────────────────────────────────────────────┐
│   Desenvolvimento (laptop)                   │
├──────────────────────────────────────────────┤
│ • 1 container PostgreSQL                     │
│ • Volume local (SSD rápido)                  │
│ • Memória: 100-500MB                         │
│ • CPU: 10-20% (idle)                         │
│ • Startup: 30-40 segundos                    │
│ • Conexões: 1-5 simultâneas                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│   Produção (recomendações)                   │
├──────────────────────────────────────────────┤
│ • Kubernetes/Docker Swarm                    │
│ • Múltiplas replicas (HA)                    │
│ • Storage externo (NFS/S3)                   │
│ • Memória: 2-8GB                             │
│ • CPU: 2-4 cores                             │
│ • Backup: Diário com replicação              │
│ • Conexões: 50-500 (pool)                    │
│ • Monitoramento: Prometheus + Grafana        │
└──────────────────────────────────────────────┘
```

---

## 🔧 Arquivos de Configuração

```
.env (SECRETO - NÃO VERSIONAR)
├─ POSTGRES_DB=appfitness_db
├─ POSTGRES_USER=appfitness_user
└─ POSTGRES_PASSWORD=****_seguro_****

Dockerfile (Imagem PostgreSQL)
├─ FROM postgres:16-alpine
├─ ENV configurações
├─ VOLUME /var/lib/postgresql/data
├─ EXPOSE 5432
└─ HEALTHCHECK pg_isready

docker-compose.yml (Orquestração)
├─ services > postgres
├─ volumes (postgres_data)
├─ networks (appfitness-network)
├─ ports (5432:5432)
└─ healthcheck

01-init-db.sql (Schema + Data)
├─ CREATE EXTENSION uuid-ossp
├─ CREATE TABLE usuario
├─ CREATE TABLE exercicio
├─ CREATE TABLE treino
├─ CREATE TABLE dieta
├─ CREATE INDEX (otimização)
└─ INSERT INTO (dados exemplo)
```

---

## 🚀 Comandos Principais

```
Iniciar:
docker-compose up -d

Parar:
docker-compose down

Status:
docker-compose ps

Logs:
docker-compose logs -f postgres

Shell psql:
docker-compose exec postgres psql -U appfitness_user -d appfitness_db

Backup:
docker-compose exec -T postgres pg_dump -U appfitness_user appfitness_db > backup.sql

Limpar tudo:
docker-compose down -v
```

---

## 📁 Localização de Arquivos

```
C:\Users\robed\Downloads\Pós Digital PUC-RIO\Projeto_Spring\app_fitness-main\
│
├── Dockerfile                          ◄─ Definição da imagem
├── docker-compose.yml                  ◄─ Orquestração
├── .env.example                        ◄─ Modelo (copie para .env)
├── .gitignore                          ◄─ Git ignore atualizado
│
├── docker-entrypoint-initdb.d/         ◄─ Scripts de inicialização
│   └── 01-init-db.sql                  ◄─ Schema + dados
│
├── docker-manage.bat                   ◄─ Gerenciamento (Windows)
├── docker-manage.sh                    ◄─ Gerenciamento (Unix)
├── test-docker-setup.sh                ◄─ Validação
│
├── QUICKSTART.md                       ◄─ Comece aqui! 5 min
├── README-DOCKER.md                    ◄─ Referência completa
├── SOLUTION-SUMMARY.md                 ◄─ Sumário da solução
└── ARCHITECTURE.md                     ◄─ Este arquivo
```

---

## 🎯 Próximos Passos

```
1️⃣ Setup Inicial
   └─► copy .env.example .env
   └─► Editar .env (alterar senha)

2️⃣ Iniciar Database
   └─► docker-compose up -d
   └─► Aguardar 30-40 segundos

3️⃣ Verificar Status
   └─► docker-compose ps
   └─► docker-compose logs postgres

4️⃣ Testar Conexão
   └─► docker-compose exec postgres psql -U appfitness_user -d appfitness_db

5️⃣ Integrar com Spring Boot
   └─► Editar application.properties
   └─► Adicionar dependência PostgreSQL
   └─► Testar conexão da aplicação

6️⃣ Produção
   └─► Implementar backups automáticos
   └─► Configurar monitoramento
   └─► Usar secrets do Docker
   └─► Replicar para HA
```

---

**Diagrama criado em**: 2024 | **Versão Docker**: 20.10+ | **Compose**: 3.8
