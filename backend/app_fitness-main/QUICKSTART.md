# ⚡ Guia Rápido - Docker PostgreSQL

## 🚀 Começar em 5 Minutos

### 1️⃣ Clonar/Preparar Variáveis
```cmd
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

### 2️⃣ Iniciar PostgreSQL
```cmd
# Windows
docker-compose up -d

# Linux/macOS
./docker-manage.sh start
```

### 3️⃣ Verificar Status
```cmd
# Windows
docker-compose ps

# Linux/macOS
./docker-manage.sh status
```

### 4️⃣ Conectar ao Banco
```cmd
# Windows
docker-compose exec postgres psql -U appfitness_user -d appfitness_db

# Linux/macOS
./docker-manage.sh shell
```

---

## 📝 Comandos Essenciais

### Iniciar e Parar
```cmd
docker-compose up -d       # Inicia em background
docker-compose down         # Para containers
docker-compose restart      # Reinicia
```

### Logs e Diagnóstico
```cmd
docker-compose logs postgres              # Ver logs
docker-compose logs -f postgres           # Logs em tempo real
docker-compose exec postgres pg_isready   # Verificar se está pronto
```

### Backup e Restauração
```cmd
# Backup
docker-compose exec -T postgres pg_dump -U appfitness_user appfitness_db > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U appfitness_user appfitness_db < backup.sql
```

### Conectar com DBeaver/pgAdmin
```
Host:      localhost
Porta:     5432
Database:  appfitness_db
Usuário:   appfitness_user
Senha:     (conforme .env)
```

---

## 🔌 Integração com Spring Boot

No arquivo `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/appfitness_db
spring.datasource.username=appfitness_user
spring.datasource.password=appfitness_secure_password_123
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

---

## 📦 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `Dockerfile` | Definição da imagem PostgreSQL |
| `docker-compose.yml` | Orquestração dos containers |
| `.env.example` | Modelo de variáveis (copie para `.env`) |
| `docker-entrypoint-initdb.d/01-init-db.sql` | Script de inicialização SQL |
| `docker-manage.bat` | Script de gerenciamento (Windows) |
| `docker-manage.sh` | Script de gerenciamento (Linux/macOS) |
| `test-docker-setup.sh` | Script de validação |
| `README-DOCKER.md` | Documentação completa |
| `.env.example` | Variáveis de ambiente |

---

## ❓ Dúvidas Frequentes

### P: Posso mudar a senha padrão?
**R:** Sim! Edite o arquivo `.env` antes de iniciar:
```
POSTGRES_PASSWORD=sua_senha_super_segura
```

### P: Onde os dados ficam armazenados?
**R:** Em um volume Docker nomeado (`postgres_data`) gerenciado automaticamente.

### P: Como faço backup?
**R:** 
```cmd
# Windows
docker-compose exec -T postgres pg_dump -U appfitness_user appfitness_db > backup.sql
```

### P: A porta 5432 está em uso, e agora?
**R:** Mude em `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Acesse em localhost:5433
```

### P: Quero limpar tudo e começar do zero?
**R:** 
```cmd
docker-compose down -v
docker-compose up -d
```

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Port already in use" | Mude porta em `docker-compose.yml` |
| "Connection refused" | Aguarde 30-40s para o banco iniciar |
| "Permission denied" | No Windows, abra CMD como Admin |
| Container exits | Veja `docker-compose logs postgres` |
| Dados sumiram | Volume foi removido com `down -v` |

---

## 📚 Documentação Completa

Leia `README-DOCKER.md` para:
- Configuração avançada
- Boas práticas de produção
- Monitoramento e performance
- Backups automáticos
- Integração com Spring Boot

---

## 🎯 Próximas Etapas

1. ✅ Edite `.env` com suas credenciais
2. ✅ Execute `docker-compose up -d`
3. ✅ Teste com `docker-compose ps`
4. ✅ Configure Spring Boot em `application.properties`
5. ✅ Inicie sua aplicação!

---

**Última atualização**: 2024 | **Docker Compose**: 3.8 | **PostgreSQL**: 16
