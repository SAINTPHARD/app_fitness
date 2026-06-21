@echo off
REM ============================================================================
REM Script para Gerenciamento do Docker Compose - App Fitness
REM ============================================================================
REM Este script facilita operações comuns com Docker e PostgreSQL no Windows
REM Uso: docker-manage.bat [comando]
REM Comandos disponíveis:
REM   start   - Inicia o PostgreSQL
REM   stop    - Para o PostgreSQL
REM   restart - Reinicia o PostgreSQL
REM   logs    - Mostra logs em tempo real
REM   backup  - Faz backup do banco de dados
REM   restore - Restaura um backup
REM   clean   - Remove volumes (perda de dados!)
REM   status  - Mostra status dos containers

setlocal enabledelayedexpansion

REM ============================================================================
REM CONFIGURAÇÕES
REM ============================================================================
set COMPOSE_FILE=docker-compose.yml
set CONTAINER_NAME=appfitness-postgres
set DB_USER=appfitness_user
set DB_NAME=appfitness_db

REM ============================================================================
REM VALIDAR ARGUMENTOS
REM ============================================================================
if "%1"=="" (
    echo.
    echo 🐳 Gerenciador Docker - App Fitness
    echo ============================================================================
    echo.
    echo Uso: docker-manage.bat [comando]
    echo.
    echo Comandos disponíveis:
    echo   start      - Inicia o PostgreSQL
    echo   stop       - Para o PostgreSQL
    echo   restart    - Reinicia o PostgreSQL
    echo   logs       - Mostra logs em tempo real
    echo   status     - Mostra status dos containers
    echo   backup     - Faz backup do banco de dados
    echo   restore    - Restaura um backup
    echo   shell      - Acessa o shell psql do PostgreSQL
    echo   clean      - Remove volumes e dados ^(CUIDADO!^)
    echo.
    exit /b 0
)

REM ============================================================================
REM PROCESSAR COMANDOS
REM ============================================================================

if /i "%1"=="start" (
    echo 🚀 Iniciando PostgreSQL...
    docker-compose up -d
    echo.
    echo ✅ PostgreSQL iniciado com sucesso!
    echo.
    echo Verificando health status...
    timeout /t 5 /nobreak
    docker-compose ps
    goto end
)

if /i "%1"=="stop" (
    echo ⏹️  Parando PostgreSQL...
    docker-compose stop
    echo ✅ PostgreSQL parado com sucesso!
    goto end
)

if /i "%1"=="restart" (
    echo 🔄 Reiniciando PostgreSQL...
    docker-compose restart postgres
    echo ✅ PostgreSQL reiniciado com sucesso!
    echo.
    echo Aguardando inicialização...
    timeout /t 5 /nobreak
    docker-compose ps
    goto end
)

if /i "%1"=="logs" (
    echo 📋 Mostrando logs em tempo real (Ctrl+C para sair)...
    echo.
    docker-compose logs -f postgres
    goto end
)

if /i "%1"=="status" (
    echo 📊 Status dos containers:
    echo.
    docker-compose ps
    echo.
    echo 📈 Informações de recursos:
    docker stats %CONTAINER_NAME% --no-stream
    goto end
)

if /i "%1"=="shell" (
    echo 🔗 Conectando ao PostgreSQL...
    docker-compose exec postgres psql -U %DB_USER% -d %DB_NAME%
    goto end
)

if /i "%1"=="backup" (
    REM Criar pasta de backups se não existir
    if not exist backups mkdir backups
    
    REM Gerar nome de arquivo com timestamp
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
    
    set BACKUP_FILE=backups\backup_!mydate!_!mytime!.sql
    
    echo 💾 Fazendo backup do banco de dados...
    echo Arquivo: !BACKUP_FILE!
    echo.
    
    docker-compose exec -T postgres pg_dump -U %DB_USER% %DB_NAME% > !BACKUP_FILE!
    
    if %errorlevel% equ 0 (
        echo ✅ Backup criado com sucesso!
        echo Localização: !BACKUP_FILE!
    ) else (
        echo ❌ Erro ao criar backup!
    )
    goto end
)

if /i "%1"=="restore" (
    if "%2"=="" (
        echo ❌ Você deve especificar o arquivo de backup!
        echo Uso: docker-manage.bat restore [arquivo.sql]
        echo.
        echo Arquivos de backup disponíveis:
        if exist backups (
            dir backups /b /o:-d
        ) else (
            echo Nenhum backup encontrado
        )
        goto end
    )
    
    echo 🔄 Restaurando backup: %2
    echo.
    echo ⚠️  AVISO: Isto vai sobrescrever os dados atuais!
    set /p confirm="Deseja continuar? (s/n): "
    
    if /i not "%confirm%"=="s" (
        echo Operação cancelada.
        goto end
    )
    
    docker-compose exec -T postgres psql -U %DB_USER% %DB_NAME% < %2
    
    if %errorlevel% equ 0 (
        echo ✅ Backup restaurado com sucesso!
    ) else (
        echo ❌ Erro ao restaurar backup!
    )
    goto end
)

if /i "%1"=="clean" (
    echo ⚠️  CUIDADO! Esta operação vai remover TODOS os dados!
    echo.
    set /p confirm="Tem certeza que deseja continuar? (s/n): "
    
    if /i not "%confirm%"=="s" (
        echo Operação cancelada.
        goto end
    )
    
    echo 🗑️  Removendo containers e volumes...
    docker-compose down -v
    echo ✅ Limpeza concluída!
    goto end
)

REM ============================================================================
REM COMANDO NÃO RECONHECIDO
REM ============================================================================
echo ❌ Comando não reconhecido: %1
echo.
echo Digite "docker-manage.bat" sem argumentos para ver a lista de comandos.
exit /b 1

:end
