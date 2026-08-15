-- ==========================================================
-- APP FITNESS — Higienização de refeições duplicadas
-- Auditoria QA #2
-- ==========================================================
-- Rode este script MANUALMENTE (psql, DBeaver etc.) contra o banco de
-- produção/dev ANTES de subir a aplicação com a constraint única
-- `uk_refeicao_usuario_data_nome` (ver Refeicao.java) — se já existirem
-- duplicatas na base, o ALTER TABLE que cria a constraint falha no boot.
--
-- Nota: este script NÃO está na pasta db/migration/ porque não é uma
-- migração versionada de schema (Flyway não está habilitado neste projeto
-- ainda — os arquivos V1/V2/V3 em db/migration/ existem mas a dependência e
-- a config do Flyway não foram adicionadas ao projeto). É uma operação de
-- dados, de uma vez só, para rodar manualmente.
--
-- O que faz:
--   1. Identifica grupos de refeições duplicadas (mesmo usuario_id + mesma
--      data_refeicao + mesmo nome, ignorando maiúsculas/espaços nas pontas).
--   2. Define a de MENOR id como a "mantida" (a mais antiga).
--   3. Reatribui todos os Alimentos das duplicatas para a refeição mantida
--      — nenhum alimento é perdido, só reorganizado.
--   4. Apaga as refeições duplicadas (agora vazias).
--
-- Execute dentro de uma transação para poder conferir antes de commitar:
--   BEGIN;
--   -- rode os 2 comandos abaixo
--   -- confira o resultado com o SELECT de verificação no fim
--   COMMIT;   -- ou ROLLBACK; se algo parecer errado
-- ==========================================================

BEGIN;

-- 1. Reatribui os alimentos das refeições duplicadas para a "mantida"
WITH duplicadas AS (
    SELECT
        id,
        usuario_id,
        data_refeicao,
        MIN(id) OVER (
            PARTITION BY usuario_id, data_refeicao, LOWER(TRIM(nome_refeicao))
        ) AS id_mantido
    FROM refeicoes
)
UPDATE alimentos a
SET refeicao_id = d.id_mantido
FROM duplicadas d
WHERE a.refeicao_id = d.id
  AND d.id <> d.id_mantido;

-- 2. Remove as refeições duplicadas, agora sem alimentos próprios
WITH duplicadas AS (
    SELECT
        id,
        MIN(id) OVER (
            PARTITION BY usuario_id, data_refeicao, LOWER(TRIM(nome_refeicao))
        ) AS id_mantido
    FROM refeicoes
)
DELETE FROM refeicoes r
USING duplicadas d
WHERE r.id = d.id
  AND d.id <> d.id_mantido;

-- 3. Verificação: esta query deve retornar ZERO linhas depois da limpeza.
-- Rode antes do COMMIT para confirmar que não sobrou nenhum grupo duplicado.
SELECT usuario_id, data_refeicao, LOWER(TRIM(nome_refeicao)) AS nome_normalizado, COUNT(*)
FROM refeicoes
GROUP BY usuario_id, data_refeicao, LOWER(TRIM(nome_refeicao))
HAVING COUNT(*) > 1;

-- Se a query acima veio vazia, pode commitar:
-- COMMIT;
