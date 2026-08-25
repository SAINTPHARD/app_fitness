-- ==========================================================
-- APP FITNESS
-- Flyway Migration V8
-- Corrige o valor de 'objetivo' semeado em V3 que nao existe
-- no enum Objetivo (EMAGRECER, MANTER, HIPERTROFIA), o que
-- derruba com 500 qualquer leitura dessa linha via
-- EnumType.STRING (ex: login do admin, listagem de usuarios).
-- ==========================================================

UPDATE usuarios
SET objetivo = 'HIPERTROFIA'
WHERE objetivo = 'GANHO_MASSA';
