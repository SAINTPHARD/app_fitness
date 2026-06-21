#!/bin/bash

# ============================================================================
# Script para Gerenciamento do Docker Compose - App Fitness
# ============================================================================
# Este script facilita operações comuns com Docker e PostgreSQL
# Uso: ./docker-manage.sh [comando]
# Comandos disponíveis:
#   start   - Inicia o PostgreSQL
#   stop    - Para o PostgreSQL
#   restart - Reinicia o PostgreSQL
#   logs    - Mostra logs em tempo real
#   backup  - Faz backup do banco de dados
#   restore - Restaura um backup
#   clean   - Remove volumes (perda de dados!)
#   status  - Mostra status dos containers

set -e

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================
COMPOSE_FILE="docker-compose.yml"
CONTAINER_NAME="appfitness-postgres"
DB_USER="appfitness_user"
DB_NAME="appfitness_db"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# VALIDAR ARGUMENTOS
# ============================================================================

if [ -z "$1" ]; then
    echo ""
    print_header "🐳 Gerenciador Docker - App Fitness"
    echo ""
    echo "Uso: ./docker-manage.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start      - Inicia o PostgreSQL"
    echo "  stop       - Para o PostgreSQL"
    echo "  restart    - Reinicia o PostgreSQL"
    echo "  logs       - Mostra logs em tempo real"
    echo "  status     - Mostra status dos containers"
    echo "  backup     - Faz backup do banco de dados"
    echo "  restore    - Restaura um backup"
    echo "  shell      - Acessa o shell psql do PostgreSQL"
    echo "  clean      - Remove volumes e dados (CUIDADO!)"
    echo ""
    exit 0
fi

# ============================================================================
# PROCESSAR COMANDOS
# ============================================================================

case "$1" in
    start)
        print_info "Iniciando PostgreSQL..."
        docker-compose up -d
        print_success "PostgreSQL iniciado com sucesso!"
        echo ""
        print_info "Verificando health status..."
        sleep 5
        docker-compose ps
        ;;

    stop)
        print_info "Parando PostgreSQL..."
        docker-compose stop
        print_success "PostgreSQL parado com sucesso!"
        ;;

    restart)
        print_info "Reiniciando PostgreSQL..."
        docker-compose restart postgres
        print_success "PostgreSQL reiniciado com sucesso!"
        echo ""
        print_info "Aguardando inicialização..."
        sleep 5
        docker-compose ps
        ;;

    logs)
        print_info "Mostrando logs em tempo real (Ctrl+C para sair)..."
        echo ""
        docker-compose logs -f postgres
        ;;

    status)
        print_header "📊 Status dos containers"
        echo ""
        docker-compose ps
        echo ""
        print_header "📈 Informações de recursos"
        docker stats $CONTAINER_NAME --no-stream 2>/dev/null || print_warning "Container não está rodando"
        ;;

    shell)
        print_info "Conectando ao PostgreSQL..."
        docker-compose exec postgres psql -U $DB_USER -d $DB_NAME
        ;;

    backup)
        # Criar pasta de backups se não existir
        mkdir -p backups
        
        # Gerar nome de arquivo com timestamp
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="backups/backup_${TIMESTAMP}.sql"
        
        print_info "Fazendo backup do banco de dados..."
        echo "Arquivo: $BACKUP_FILE"
        echo ""
        
        if docker-compose exec -T postgres pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"; then
            print_success "Backup criado com sucesso!"
            echo "Localização: $BACKUP_FILE"
            ls -lh "$BACKUP_FILE"
        else
            print_error "Erro ao criar backup!"
            exit 1
        fi
        ;;

    restore)
        if [ -z "$2" ]; then
            print_error "Você deve especificar o arquivo de backup!"
            echo "Uso: ./docker-manage.sh restore [arquivo.sql]"
            echo ""
            print_info "Arquivos de backup disponíveis:"
            if [ -d "backups" ]; then
                ls -lh backups/ 2>/dev/null || print_warning "Nenhum backup encontrado"
            else
                print_warning "Nenhum backup encontrado"
            fi
            exit 1
        fi
        
        print_info "Restaurando backup: $2"
        echo ""
        print_warning "AVISO: Isto vai sobrescrever os dados atuais!"
        read -p "Deseja continuar? (s/n): " confirm
        
        if [ "$confirm" != "s" ]; then
            print_info "Operação cancelada."
            exit 0
        fi
        
        if docker-compose exec -T postgres psql -U $DB_USER $DB_NAME < "$2"; then
            print_success "Backup restaurado com sucesso!"
        else
            print_error "Erro ao restaurar backup!"
            exit 1
        fi
        ;;

    clean)
        print_warning "CUIDADO! Esta operação vai remover TODOS os dados!"
        echo ""
        read -p "Tem certeza que deseja continuar? (s/n): " confirm
        
        if [ "$confirm" != "s" ]; then
            print_info "Operação cancelada."
            exit 0
        fi
        
        print_info "Removendo containers e volumes..."
        docker-compose down -v
        print_success "Limpeza concluída!"
        ;;

    *)
        print_error "Comando não reconhecido: $1"
        echo ""
        echo "Digite './docker-manage.sh' sem argumentos para ver a lista de comandos."
        exit 1
        ;;
esac
