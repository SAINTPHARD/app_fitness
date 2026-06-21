-- ============================================================================
-- Script SQL de Inicialização para PostgreSQL - App Fitness
-- ============================================================================
-- Este script é executado automaticamente quando o container é iniciado
-- pela primeira vez. Aqui criamos tabelas e dados iniciais para a aplicação.

-- ============================================================================
-- CRIAÇÃO DE EXTENSÕES
-- ============================================================================
-- Habilita a extensão UUID para gerar identificadores únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CRIAÇÃO DE TABELAS
-- ============================================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100),
    idade INTEGER,
    peso DECIMAL(5, 2),
    altura DECIMAL(3, 2),
    objetivo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Exercícios
CREATE TABLE IF NOT EXISTS exercicio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    grupo_muscular VARCHAR(50),
    dificuldade VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Treinos
CREATE TABLE IF NOT EXISTS treino (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_inicio DATE,
    data_fim DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Dietas
CREATE TABLE IF NOT EXISTS dieta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    calorias_diarias INTEGER,
    proteinas DECIMAL(5, 2),
    carboidratos DECIMAL(5, 2),
    gorduras DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CRIAÇÃO DE ÍNDICES PARA OTIMIZAÇÃO
-- ============================================================================
-- Índices para melhorar a performance de buscas frequentes

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_treino_usuario ON treino(usuario_id);
CREATE INDEX IF NOT EXISTS idx_dieta_usuario ON dieta(usuario_id);

-- ============================================================================
-- DADOS DE EXEMPLO
-- ============================================================================
-- Insere dados de exemplo para testes da aplicação

-- Inserir um usuário de exemplo
INSERT INTO usuario (email, password, nome, sobrenome, idade, peso, altura, objetivo)
VALUES (
    'teste@appfitness.com',
    'senha_hash_exemplo',
    'João',
    'Silva',
    30,
    75.50,
    1.80,
    'Ganho de Massa'
) ON CONFLICT (email) DO NOTHING;

-- Inserir exercícios de exemplo
INSERT INTO exercicio (nome, descricao, grupo_muscular, dificuldade)
VALUES 
    ('Supino', 'Exercício de peitoral com barra', 'Peito', 'Intermediário'),
    ('Agachamento', 'Exercício fundamental para pernas', 'Pernas', 'Intermediário'),
    ('Rosca Direta', 'Exercício de bíceps com halteres', 'Braços', 'Fácil'),
    ('Perdida de Peso', 'Exercício de cardio intenso', 'Cardio', 'Difícil')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS E OBSERVAÇÕES
-- ============================================================================
-- Este script cria a estrutura básica do banco de dados para a aplicação
-- App Fitness. Todos os dados são armazenados de forma persistente graças
-- ao volume configurado no docker-compose.yml
-- 
-- Modificações futuras devem ser feitas em novos scripts SQL com nomes
-- numerados sequencialmente (ex: 02-adicionar-coluna.sql)
