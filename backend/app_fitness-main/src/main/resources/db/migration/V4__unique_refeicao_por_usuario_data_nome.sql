-- ==========================================================
-- APP FITNESS
-- Flyway Migration V4
-- Auditoria QA #2 — impede duas refeições com o mesmo nome, para o mesmo
-- usuário, na mesma data (ex: dois "Café da manhã" no mesmo dia).
-- ==========================================================
--
-- PRÉ-REQUISITO: rode db/scripts/higienizar_refeicoes_duplicadas.sql antes
-- desta migração se a base já tiver duplicatas — senão o ALTER TABLE abaixo
-- falha.
--
-- NOTA: assim como V1-V3, este arquivo só roda de verdade se o Flyway for
-- habilitado no projeto (dependência + spring.flyway.* no application*.
-- properties) — hoje o schema é gerenciado por `spring.jpa.hibernate.ddl-
-- auto=update`/`validate`, e a mesma constraint já está declarada
-- diretamente na entidade `Refeicao` (`@Table(uniqueConstraints = ...)`),
-- que é o que realmente cria/valida a constraint enquanto o Flyway não
-- estiver ligado.

ALTER TABLE refeicoes
    ADD CONSTRAINT uk_refeicao_usuario_data_nome
    UNIQUE (usuario_id, data_refeicao, nome_refeicao);
