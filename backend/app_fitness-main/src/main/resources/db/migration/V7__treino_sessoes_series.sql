-- ==========================================================
-- APP FITNESS
-- Flyway Migration V7
-- Refatoração da execução de treino: dia da semana na ficha, prevenção de
-- exercício duplicado, sessões de execução e séries (carga/reps reais).
-- ==========================================================
-- NOTA: assim como V1-V6, este arquivo só roda de verdade se o Flyway for
-- habilitado no projeto — hoje o schema é gerenciado por
-- `spring.jpa.hibernate.ddl-auto` (update em dev, validate em prod). As
-- mesmas estruturas já estão declaradas nas entidades JPA
-- (`Treino.diaSemana`, `@UniqueConstraint` em `Exercicio`/`SessaoTreino`,
-- `SessaoTreino`, `Serie`), que é o que realmente cria/valida o schema
-- enquanto o Flyway não estiver ligado.

------------------------------------------------------------
-- TREINOS: dia da semana da ficha
------------------------------------------------------------
ALTER TABLE treinos ADD COLUMN dia_semana VARCHAR(20);

------------------------------------------------------------
-- EXERCICIOS: impedir duplicidade na mesma ficha
------------------------------------------------------------
CREATE UNIQUE INDEX uk_exercicio_treino_nome
    ON exercicios (treino_id, LOWER(TRIM(nome)));

------------------------------------------------------------
-- SESSOES_TREINO: execução real de uma ficha num dia
------------------------------------------------------------
CREATE TABLE sessoes_treino (

    id BIGSERIAL PRIMARY KEY,

    treino_id BIGINT NOT NULL,

    usuario_id BIGINT NOT NULL,

    data DATE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',

    horario_inicio TIMESTAMP,

    horario_fim TIMESTAMP,

    CONSTRAINT fk_sessao_treino
        FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,

    CONSTRAINT fk_sessao_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    CONSTRAINT uk_sessao_treino_data UNIQUE (treino_id, data)

);

CREATE INDEX idx_sessao_usuario ON sessoes_treino(usuario_id);

------------------------------------------------------------
-- SERIES: carga/repetições realmente executadas por série
------------------------------------------------------------
CREATE TABLE series (

    id BIGSERIAL PRIMARY KEY,

    sessao_id BIGINT NOT NULL,

    exercicio_id BIGINT NOT NULL,

    ordem_exercicio INTEGER NOT NULL,

    numero_serie INTEGER NOT NULL,

    -- Nulável de propósito: distingue "sem carga registrada" de "carga zero"
    -- (regra de negócio da refatoração da tela de execução).
    carga DECIMAL(6,2),

    repeticoes INTEGER,

    tipo VARCHAR(20) NOT NULL DEFAULT 'NORMAL',

    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',

    horario_inicio TIMESTAMP,

    horario_conclusao TIMESTAMP,

    duracao_descanso_segundos INTEGER,

    -- Reservado para a sincronização offline (fase futura) — idempotência
    -- de séries salvas localmente antes de reconectar.
    idempotency_key VARCHAR(100) UNIQUE,

    CONSTRAINT fk_serie_sessao
        FOREIGN KEY (sessao_id) REFERENCES sessoes_treino(id) ON DELETE CASCADE,

    CONSTRAINT fk_serie_exercicio
        FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE

);

CREATE INDEX idx_serie_sessao ON series(sessao_id);
CREATE INDEX idx_serie_exercicio ON series(exercicio_id);
