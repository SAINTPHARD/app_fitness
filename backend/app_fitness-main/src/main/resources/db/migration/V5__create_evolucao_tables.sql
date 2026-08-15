-- ==========================================================
-- APP FITNESS
-- Flyway Migration V5
-- Auditoria QA #4/#5 — persistência server-side para Evolução.
-- ==========================================================

CREATE TABLE evolucao_pesos (
    id BIGSERIAL PRIMARY KEY,
    data_registro DATE NOT NULL,
    peso DOUBLE PRECISION NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_evolucao_peso_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT uk_evolucao_peso_usuario_data
        UNIQUE (usuario_id, data_registro)
);

CREATE TABLE evolucao_medidas (
    id BIGSERIAL PRIMARY KEY,
    data_registro DATE NOT NULL,
    cintura DOUBLE PRECISION,
    braco DOUBLE PRECISION,
    perna DOUBLE PRECISION,
    gordura DOUBLE PRECISION,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_evolucao_medida_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT uk_evolucao_medida_usuario_data
        UNIQUE (usuario_id, data_registro)
);

CREATE TABLE evolucao_fotos (
    id BIGSERIAL PRIMARY KEY,
    data_registro DATE NOT NULL,
    src TEXT NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_evolucao_foto_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_evolucao_pesos_usuario_data
    ON evolucao_pesos(usuario_id, data_registro);

CREATE INDEX idx_evolucao_medidas_usuario_data
    ON evolucao_medidas(usuario_id, data_registro);

CREATE INDEX idx_evolucao_fotos_usuario_data
    ON evolucao_fotos(usuario_id, data_registro);
