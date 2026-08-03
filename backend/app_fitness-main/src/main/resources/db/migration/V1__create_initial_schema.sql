-- ==========================================================
-- APP FITNESS
-- Flyway Migration V1
-- Criação do Schema Inicial
-- ==========================================================

------------------------------------------------------------
-- TABELA USUARIOS
------------------------------------------------------------
CREATE TABLE usuarios (

    id BIGSERIAL PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    senha VARCHAR(255) NOT NULL,

    idade INTEGER,

    peso DECIMAL(5,2),

    altura DECIMAL(5,2),

    sexo CHAR(1),

    objetivo VARCHAR(50)

);

------------------------------------------------------------
-- TABELA DIETAS
------------------------------------------------------------
CREATE TABLE dietas (

    id BIGSERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    calorias INTEGER NOT NULL,

    refeicoes VARCHAR(500),

    carboidratos DECIMAL(8,2),

    proteinas DECIMAL(8,2),

    gorduras DECIMAL(8,2),

    usuario_id BIGINT,

    CONSTRAINT fk_dieta_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

------------------------------------------------------------
-- TABELA TREINOS
------------------------------------------------------------
CREATE TABLE treinos (

    id BIGSERIAL PRIMARY KEY,

    nome_treino VARCHAR(100),

    tipo_treino VARCHAR(100),

    duracao INTEGER,

    intensidade VARCHAR(50),

    frequencia VARCHAR(100),

    usuario_id BIGINT,

    CONSTRAINT fk_treino_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

------------------------------------------------------------
-- TABELA EXERCICIOS
------------------------------------------------------------
CREATE TABLE exercicios (

    id BIGSERIAL PRIMARY KEY,

    nome VARCHAR(150),

    series INTEGER,

    repeticoes INTEGER,

    duracao INTEGER,

    descricao TEXT,

    treino_id BIGINT,

    CONSTRAINT fk_exercicio_treino
        FOREIGN KEY(treino_id)
        REFERENCES treinos(id)
        ON DELETE CASCADE

);

------------------------------------------------------------
-- TABELA REFEICOES
------------------------------------------------------------
CREATE TABLE refeicoes (

    id BIGSERIAL PRIMARY KEY,

    nome_refeicao VARCHAR(100) NOT NULL,

    data_refeicao DATE NOT NULL,

    horario VARCHAR(5),

    status VARCHAR(20),

    usuario_id BIGINT NOT NULL,

    CONSTRAINT fk_refeicao_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

------------------------------------------------------------
-- TABELA ALIMENTOS
------------------------------------------------------------
CREATE TABLE alimentos (

    id BIGSERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    quantidade VARCHAR(50),

    calorias INTEGER,

    carboidratos DECIMAL(8,2),

    proteinas DECIMAL(8,2),

    gorduras DECIMAL(8,2),

    refeicao_id BIGINT,

    CONSTRAINT fk_alimento_refeicao
        FOREIGN KEY(refeicao_id)
        REFERENCES refeicoes(id)
        ON DELETE CASCADE

);