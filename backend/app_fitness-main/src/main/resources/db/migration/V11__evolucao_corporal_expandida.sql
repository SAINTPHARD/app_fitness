ALTER TABLE evolucao_medidas ADD COLUMN torax DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN quadril DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN pescoco DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN braco_direito DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN braco_esquerdo DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN perna_direita DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN perna_esquerda DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN panturrilha_direita DOUBLE PRECISION;
ALTER TABLE evolucao_medidas ADD COLUMN panturrilha_esquerda DOUBLE PRECISION;

ALTER TABLE evolucao_fotos ADD COLUMN pose VARCHAR(20);
ALTER TABLE evolucao_fotos ADD COLUMN descricao VARCHAR(500);
ALTER TABLE evolucao_fotos ADD COLUMN tipo_conteudo VARCHAR(50);

UPDATE evolucao_fotos SET pose = 'FRENTE' WHERE pose IS NULL;
ALTER TABLE evolucao_fotos ALTER COLUMN pose SET NOT NULL;
