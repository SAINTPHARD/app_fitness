ALTER TABLE series ADD COLUMN unidade_carga VARCHAR(10) NOT NULL DEFAULT 'KG';
ALTER TABLE series ADD COLUMN rir INTEGER;
ALTER TABLE series ADD COLUMN rpe DECIMAL(3,1);
ALTER TABLE series ADD COLUMN observacao VARCHAR(500);

ALTER TABLE series ADD CONSTRAINT chk_series_rir CHECK (rir IS NULL OR (rir >= 0 AND rir <= 10));
ALTER TABLE series ADD CONSTRAINT chk_series_rpe CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10));
