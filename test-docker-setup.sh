#!/bin/bash

# ============================================================================
# Script de Teste - Validar Setup Docker PostgreSQL
# ============================================================================
# Este script testa se o Docker, Docker Compose e PostgreSQL estão
# corretamente configurados e prontos para usar.

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_test() {
    echo -ne "🧪 Testando: $1... "
    ((TESTS_TOTAL++))
}

print_pass() {
    echo -e "${GREEN}✓${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗${NC}"
    echo -e "  ${RED}Erro: $1${NC}"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# TESTES PRINCIPAIS
# ============================================================================

main() {
    print_header "🐳 Validação de Setup - Docker PostgreSQL"

    # Teste 1: Docker instalado
    print_test "Docker instalado"
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_pass
        print_info "$DOCKER_VERSION"
    else
        print_fail "Docker não está instalado. Visite: https://www.docker.com/get-started"
        exit 1
    fi

    # Teste 2: Docker Compose instalado
    print_test "Docker Compose instalado"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_pass
        print_info "$COMPOSE_VERSION"
    else
        print_fail "Docker Compose não está instalado"
        exit 1
    fi

    # Teste 3: Docker daemon rodando
    print_test "Docker daemon rodando"
    if docker ps &> /dev/null; then
        print_pass
    else
        print_fail "Docker daemon não está rodando. Inicie o Docker Desktop."
        exit 1
    fi

    # Teste 4: Arquivo Dockerfile existe
    print_test "Arquivo Dockerfile existe"
    if [ -f "Dockerfile" ]; then
        print_pass
    else
        print_fail "Dockerfile não encontrado no diretório atual"
    fi

    # Teste 5: Arquivo docker-compose.yml existe
    print_test "Arquivo docker-compose.yml existe"
    if [ -f "docker-compose.yml" ]; then
        print_pass
    else
        print_fail "docker-compose.yml não encontrado"
    fi

    # Teste 6: Validar docker-compose.yml
    print_test "Validar syntax docker-compose.yml"
    if docker-compose config > /dev/null 2>&1; then
        print_pass
    else
        print_fail "docker-compose.yml tem erros de syntax"
        docker-compose config
    fi

    # Teste 7: Arquivo .env existe
    print_test "Arquivo .env existe"
    if [ -f ".env" ]; then
        print_pass
    else
        print_warning ".env não encontrado - copie .env.example para .env"
    fi

    # Teste 8: Script SQL existe
    print_test "Script de inicialização SQL existe"
    if [ -f "docker-entrypoint-initdb.d/01-init-db.sql" ]; then
        print_pass
    else
        print_fail "Script SQL não encontrado em docker-entrypoint-initdb.d/"
    fi

    # Teste 9: Porta 5432 disponível (opcional)
    print_test "Porta 5432 disponível"
    if ! netstat -tuln 2>/dev/null | grep -q ":5432"; then
        print_pass
    else
        print_warning "Porta 5432 já está em uso"
    fi

    # Teste 10: Espaço em disco
    print_test "Espaço em disco disponível"
    DISK_FREE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$DISK_FREE" -gt 5 ]; then
        print_pass
        print_info "Espaço livre: ${DISK_FREE}GB"
    else
        print_fail "Espaço em disco insuficiente (< 5GB). Disponível: ${DISK_FREE}GB"
    fi

    # ========================================================================
    # TESTES DE FUNCIONALIDADE (Opcional)
    # ========================================================================
    
    echo ""
    read -p "Deseja executar testes de funcionalidade? (pode levar ~2 min) (s/n): " run_functional
    
    if [ "$run_functional" = "s" ]; then
        print_header "🔧 Testes de Funcionalidade"
        
        # Teste 11: Build da imagem
        print_test "Build da imagem Docker"
        if docker-compose build 2>&1 | tail -n 5; then
            print_pass
        else
            print_fail "Erro ao fazer build da imagem"
        fi
        
        # Teste 12: Container inicia
        print_test "Container inicia"
        if docker-compose up -d 2>&1 | grep -q "Starting"; then
            print_pass
            sleep 10
        else
            print_fail "Erro ao iniciar container"
        fi
        
        # Teste 13: Health check
        print_test "PostgreSQL health check"
        HEALTH=$(docker-compose exec -T postgres pg_isready -U appfitness_user -d appfitness_db)
        if echo "$HEALTH" | grep -q "accepting"; then
            print_pass
            print_info "$HEALTH"
        else
            print_fail "PostgreSQL não respondendo ao health check"
        fi
        
        # Teste 14: Conectar ao banco
        print_test "Conectar ao banco e listar tabelas"
        if docker-compose exec -T postgres psql -U appfitness_user -d appfitness_db -c "\dt" &> /dev/null; then
            print_pass
        else
            print_fail "Erro ao conectar ao banco"
        fi
        
        # Teste 15: Dados foram inseridos
        print_test "Dados de exemplo foram inseridos"
        USER_COUNT=$(docker-compose exec -T postgres psql -U appfitness_user -d appfitness_db -t -c "SELECT COUNT(*) FROM usuario;")
        if [ "$USER_COUNT" -gt 0 ]; then
            print_pass
            print_info "Usuários inseridos: $USER_COUNT"
        else
            print_warning "Nenhum usuário de exemplo foi inserido"
        fi
        
        # Cleanup
        print_info "Parando containers..."
        docker-compose down
    fi

    # ========================================================================
    # RELATÓRIO FINAL
    # ========================================================================
    
    print_header "📊 Relatório de Testes"
    
    echo "Total de testes: $TESTS_TOTAL"
    echo -e "Testes bem-sucedidos: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Testes falhados: ${RED}$TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "Todos os testes passaram! Sistema pronto para usar."
        echo ""
        print_info "Próximos passos:"
        echo "  1. docker-compose up -d      # Inicia o PostgreSQL"
        echo "  2. ./docker-manage.sh shell   # Conecta ao banco"
        echo ""
        return 0
    else
        print_warning "Alguns testes falharam. Revise os erros acima."
        return 1
    fi
}

# ============================================================================
# EXECUTAR MAIN
# ============================================================================

main
