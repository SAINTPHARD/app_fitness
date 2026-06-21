# ============================================================================
# Dockerfile para PostgreSQL - Optimizado para Produção
# ============================================================================
# Este Dockerfile cria uma imagem Docker para PostgreSQL 16 com 
# configurações de segurança, persistência de dados e inicialização automática.

# Use a imagem oficial do PostgreSQL versão 16 (LTS - Long Term Support)
FROM postgres:16-alpine

# Define o mantenedor da imagem
LABEL maintainer="DevOps Team" version="1.0"

# ============================================================================
# VARIÁVEIS DE AMBIENTE - Configuração do PostgreSQL
# ============================================================================
# POSTGRES_DB: Nome do banco de dados padrão a ser criado
ENV POSTGRES_DB=appfitness_db

# POSTGRES_USER: Usuário administrativo do PostgreSQL
ENV POSTGRES_USER=appfitness_user

# POSTGRES_PASSWORD: Senha do usuário (IMPORTANTE: Alterar em produção!)
ENV POSTGRES_PASSWORD=appfitness_secure_password_123

# POSTGRES_INITDB_ARGS: Argumentos adicionais para inicialização do PostgreSQL
# Aqui definimos a localidade e encoding como UTF-8
ENV POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=pt_BR.UTF-8"

# ============================================================================
# VOLUMES - Persistência de Dados
# ============================================================================
# Define um volume para armazenar os dados do PostgreSQL
# Isso garante que os dados persistam mesmo se o container for removido
VOLUME ["/var/lib/postgresql/data"]

# ============================================================================
# CÓPIA DE SCRIPTS DE INICIALIZAÇÃO
# ============================================================================
# Copia scripts SQL personalizados para a pasta de inicialização do PostgreSQL
# Qualquer arquivo .sql ou .sh nesta pasta será executado automaticamente
# quando o container for iniciado pela primeira vez
COPY ./docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

# Define permissões de execução para scripts shell
RUN chmod +x /docker-entrypoint-initdb.d/*.sh 2>/dev/null || true

# ============================================================================
# EXPOSE - Porta do PostgreSQL
# ============================================================================
# Expõe a porta padrão do PostgreSQL (5432) para conexões externas
# Esta porta pode ser mapeada para a máquina host no docker-compose.yml
EXPOSE 5432

# ============================================================================
# HEALTHCHECK - Verificação de Integridade
# ============================================================================
# Executa um comando de verificação para garantir que o PostgreSQL está pronto
# --interval=10s: Executa o health check a cada 10 segundos
# --timeout=5s: Tempo máximo de espera pela resposta (5 segundos)
# --retries=5: Número máximo de tentativas antes de marcar como "unhealthy"
# --start-period=40s: Tempo de espera antes de iniciar as verificações
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=40s \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB

# ============================================================================
# COMANDO DE INICIALIZAÇÃO
# ============================================================================
# Usa o entrypoint padrão do PostgreSQL que cuida de toda a inicialização
CMD ["postgres"]
