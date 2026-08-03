package com.appfitness.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.Alimento;

/**
 * Interface de repositório para a entidade Alimento.
 *
 * Ao estender `JpaRepository<Alimento, Long>`, o Spring Data JPA gera
 * automaticamente, em tempo de execução, toda a implementação das operações
 * básicas de persistência (save, findById, findAll, delete, etc.) — não
 * escrevemos nenhuma query SQL manual para esses casos: o Spring cria um proxy
 * que traduz essas chamadas de método em comandos SQL via Hibernate.
 *
 * Assim como `RefeicaoRepository`, esta interface pode ganhar métodos de
 * consulta derivados do nome (ex: `findByNomeContainingIgnoreCase`) sempre
 * que uma busca direta por alimento (fora do contexto de uma Refeição) for
 * necessária — hoje o CRUD de Alimento é feito majoritariamente através da
 * Refeição "pai" (ver `RefeicaoService`/`AlimentoService`), mas o repositório
 * já fica pronto para consultas próprias sem precisar de alterações futuras.
 */
public interface AlimentoRepository extends JpaRepository<Alimento, Long> {
}
