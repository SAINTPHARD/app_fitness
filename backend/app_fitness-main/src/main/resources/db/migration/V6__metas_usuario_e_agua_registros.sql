-- ==========================================================
-- APP FITNESS
-- Flyway Migration V6
-- Metas diarias persistidas e eventos de hidratacao.
-- ==========================================================

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS meta_calorias INTEGER,
    ADD COLUMN IF NOT EXISTS meta_proteinas INTEGER,
    ADD COLUMN IF NOT EXISTS meta_carboidratos INTEGER,
    ADD COLUMN IF NOT EXISTS meta_gorduras INTEGER,
    ADD COLUMN IF NOT EXISTS meta_agua_ml INTEGER;

CREATE TABLE IF NOT EXISTS agua_registros (
    id BIGSERIAL PRIMARY KEY,
    quantidade_ml INTEGER NOT NULL,
    dia_referencia DATE NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    origem VARCHAR(30) NOT NULL DEFAULT 'manual',
    criado_em TIMESTAMP NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_agua_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agua_usuario_dia
    ON agua_registros(usuario_id, dia_referencia);
