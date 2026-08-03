package com.appfitness.event;

/**
 * Publicado sempre que os itens (Alimentos) de uma Refeição mudam — hoje só
 * ao adicionar um novo Alimento (ver `RefeicaoService.adicionarAlimento`).
 * Consumido apenas por efeitos colaterais (ver
 * `ItensRefeicaoAtualizadosListener`), nunca pela resposta HTTP em si — o
 * endpoint continua devolvendo a Refeição atualizada diretamente,
 * independente deste evento.
 */
public record ItensRefeicaoAtualizadosEvent(Long refeicaoId) {
}
