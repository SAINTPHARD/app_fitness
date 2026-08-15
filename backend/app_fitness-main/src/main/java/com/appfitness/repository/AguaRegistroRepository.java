package com.appfitness.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appfitness.model.entity.AguaRegistro;

@Repository
public interface AguaRegistroRepository extends JpaRepository<AguaRegistro, Long> {

    /**
     * Retorna todos os registros de água de um usuário específico em um determinado dia, ordenados por data e hora e, em caso de empate, pelo ID do registro.
     * @param usuarioId
     * @param diaReferencia
     * @return
     * OrderByDataHoraAscIdAsc: O 'IdAsc' atua como desempate (tie-breaker) para garantir 
     * uma ordem consistente no frontend caso o usuário registre dois copos no mesmo milissegundo.
     */
    List<AguaRegistro> findByUsuarioIdAndDiaReferenciaOrderByDataHoraAscIdAsc(Long usuarioId, LocalDate diaReferencia);

  
    /**
     * Retorna um registro de água específico de um usuário, garantindo que o registro pertença ao usuário correto.
     * O 'usuarioId' na query atua como blindagem de segurança contra IDOR,
     * impedindo que um usuário acesse, edite ou delete registros de água de terceiros.
     */
    Optional<AguaRegistro> findByIdAndUsuarioId(Long id, Long usuarioId);
}