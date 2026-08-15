package com.appfitness.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.AguaRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.AguaRegistroRepository;

/**
 * Serviço responsável por gerenciar os registros de consumo de água do usuário.
 * Este serviço encapsula a lógica de negócios relacionada à hidratação diária 
 * e interage com o repositório correspondente, garantindo validações e segurança.
 */
@Service // Indica que esta classe é um componente de serviço do Spring, permitindo injeção de dependências
public class AguaRegistroService {

    // Injeção de dependência do repositório de registros de água.
    private final AguaRegistroRepository repository;

    /**
     * Construtor para injeção de dependências do repositório.
     * @param repository: Repositório para gerenciar os dados de água no banco.
     */
    public AguaRegistroService(AguaRegistroRepository repository) {
        this.repository = repository;
    }

    /**
     * Lista todos os registros de água de um usuário específico para um dia de referência, 
     * ordenados por horário e ID em ordem ascendente.
     * @param usuario : O usuário autenticado proprietário dos dados.
     * @param diaReferencia : A data específica a ser consultada.
     * @return Lista de registros de água do dia.
     */
    @Transactional(readOnly = true)
    public List<AguaRegistro> listarPorDia(Usuario usuario, LocalDate diaReferencia) {
        return repository.findByUsuarioIdAndDiaReferenciaOrderByDataHoraAscIdAsc(usuario.getId(), diaReferencia);
    }

    /**
     * Cria e salva um novo registro de consumo de água para o usuário especificado.
     * Valida a quantidade e define a origem padrão como "manual" caso venha vazia.
     * @param registro : O objeto contendo os dados do consumo de água.
     * @param usuario : O usuário ao qual o registro pertence.
     * @return O registro de água salvo.
     */
    @Transactional
    public AguaRegistro criar(AguaRegistro registro, Usuario usuario) {
        validarQuantidade(registro.getQuantidadeMl());
        
        registro.setUsuario(usuario);
        
        if (registro.getOrigem() == null || registro.getOrigem().isBlank()) {
            registro.setOrigem("manual");
        }
        
        return repository.save(registro);
    }

    /**
     * Atualiza um registro de consumo de água existente, garantindo que o usuário 
     * só possa alterar os seus próprios registros (Prevenção contra IDOR).
     * @param id : ID do registro a ser atualizado.
     * @param dados : Novos dados informados para atualização.
     * @param usuario : O usuário que está a realizar a operação.
     * @return O registro de água atualizado.
     */
    @Transactional
    public AguaRegistro atualizar(Long id, AguaRegistro dados, Usuario usuario) {
        validarQuantidade(dados.getQuantidadeMl());
        
        // Busca o registro garantindo que pertence ao usuário logado (Segurança contra IDOR)
        AguaRegistro existente = repository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de água não encontrado."));

        existente.setQuantidadeMl(dados.getQuantidadeMl());
        existente.setDiaReferencia(dados.getDiaReferencia());
        existente.setDataHora(dados.getDataHora());
        existente.setOrigem(dados.getOrigem() == null || dados.getOrigem().isBlank() ? "manual" : dados.getOrigem());
        
        return repository.save(existente);
    }

    /**
     * Deleta um registro de água específico, garantindo que o usuário só possa deletar 
     * os seus próprios registros. Se não existir ou pertencer a outro usuário, lança exceção 404.
     * @param id : ID do registro de água a ser deletado.
     * @param usuario : O usuário que está tentando deletar o registro.
     */
    @Transactional
    public void deletar(Long id, Usuario usuario) {
        AguaRegistro existente = repository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de água não encontrado."));
        
        repository.delete(existente);
    }

    /**
     * Valida se a quantidade de mililitros informada está dentro de limites lógicos e aceitáveis.
     * @param quantidadeMl : Quantidade em ml a ser validada.
     */
    private void validarQuantidade(Integer quantidadeMl) {
        if (quantidadeMl == null || quantidadeMl <= 0 || quantidadeMl > 5000) {
            throw new IllegalArgumentException("A quantidade de água deve estar entre 1 e 5000 ml.");
        }
    }
}