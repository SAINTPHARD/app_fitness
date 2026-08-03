-- ====================================================
-- Índices para otimizar consultas
-- ====================================================

CREATE INDEX idx_usuario_email
ON usuarios(email);

CREATE INDEX idx_dieta_usuario
ON dietas(usuario_id);

CREATE INDEX idx_treino_usuario
ON treinos(usuario_id);

CREATE INDEX idx_refeicao_usuario
ON refeicoes(usuario_id);

CREATE INDEX idx_refeicao_data
ON refeicoes(data_refeicao);

CREATE INDEX idx_alimento_refeicao
ON alimentos(refeicao_id);

CREATE INDEX idx_exercicio_treino
ON exercicios(treino_id);