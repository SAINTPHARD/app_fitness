package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.FotoProgresso;
import com.appfitness.model.entity.MedidaCorporal;
import com.appfitness.model.entity.PesoRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.FotoProgressoRepository;
import com.appfitness.repository.MedidaCorporalRepository;
import com.appfitness.repository.PesoRegistroRepository;
/**
 * Serviço responsável por gerenciar a evolução do usuário, incluindo registros de peso, medidas corporais e fotos de progresso.
 * Este serviço encapsula a lógica de negócios relacionada à evolução do usuário e interage com os repositórios correspondentes.
 */
@Service // Indica que esta classe é um componente de serviço do Spring, permitindo injeção de dependências
public class EvolucaoService {

	// Injeção de dependência dos repositórios de evolução do usuário.
    private final PesoRegistroRepository pesoRepository;
    private final MedidaCorporalRepository medidaRepository;
    private final FotoProgressoRepository fotoRepository;

    /**
     * Construtor para injeção de dependências dos repositórios.
     * @param pesoRepository: Repositório para gerenciar registros de peso.
     * @param medidaRepository: Repositório para gerenciar medidas corporais.
     * @param fotoRepository: Repositório para gerenciar fotos de progresso.
     */
    public EvolucaoService(
            PesoRegistroRepository pesoRepository,
            MedidaCorporalRepository medidaRepository,
            FotoProgressoRepository fotoRepository) {
        this.pesoRepository = pesoRepository;
        this.medidaRepository = medidaRepository;
        this.fotoRepository = fotoRepository;
    }

    /**
     * Lista todos os registros de peso de um usuário específico, ordenados por data e ID em ordem ascendente.
     * @param usuario
     * @return
     */
    public List<PesoRegistro> listarPesos(Usuario usuario) {
        return pesoRepository.findByUsuarioIdOrderByDataAscIdAsc(usuario.getId());
    }

    /**
     * Salva um registro de peso para o usuário especificado. Se já existir um registro para a mesma data, ele será atualizado.
     * @param registro : O registro de peso a ser salvo.
     * @param usuario : O usuário ao qual o registro pertence.
     * @return O registro de peso salvo ou atualizado.
     */
    @Transactional
    public PesoRegistro salvarPeso(PesoRegistro registro, Usuario usuario) {
        validarPeso(registro.getPeso());

        PesoRegistro destino = pesoRepository
                .findByUsuarioIdAndData(usuario.getId(), registro.getData())
                .orElseGet(PesoRegistro::new);

        destino.setUsuario(usuario);
        destino.setData(registro.getData());
        destino.setPeso(registro.getPeso());
        return pesoRepository.save(destino);
    }

    // Atualiza um registro de peso existente, garantindo que o usuário só possa atualizar seus próprios registros.
    @Transactional
    public PesoRegistro atualizarPeso(Long id, PesoRegistro registro, Usuario usuario) {
        validarPeso(registro.getPeso());

        PesoRegistro existente = pesoRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de peso não encontrado."));

        existente.setData(registro.getData());
        existente.setPeso(registro.getPeso());
        return pesoRepository.save(existente);
    }

    /**
	 * Deleta um registro de peso específico, garantindo que o usuário só possa deletar seus próprios registros.
	 * Se o registro não existir ou pertencer a outro usuário, lança uma exceção.
	 * @param id : ID do registro de peso a ser deletado.
	 * @param usuario : O usuário que está tentando deletar o registro.
	 */
    @Transactional
    public void deletarPeso(Long id, Usuario usuario) {
        PesoRegistro existente = pesoRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de peso não encontrado."));
        pesoRepository.delete(existente);
    }

    public List<MedidaCorporal> listarMedidas(Usuario usuario) {
        return medidaRepository.findByUsuarioIdOrderByDataAscIdAsc(usuario.getId());
    }

    @Transactional
    public MedidaCorporal salvarMedida(MedidaCorporal registro, Usuario usuario) {
        validarMedidas(registro);

        MedidaCorporal destino = medidaRepository
                .findByUsuarioIdAndData(usuario.getId(), registro.getData())
                .orElseGet(MedidaCorporal::new);

        destino.setUsuario(usuario);
        copiarMedidas(registro, destino);
        return medidaRepository.save(destino);
    }

    @Transactional
    public MedidaCorporal atualizarMedida(Long id, MedidaCorporal registro, Usuario usuario) {
        validarMedidas(registro);

        MedidaCorporal existente = medidaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de medidas não encontrado."));

        copiarMedidas(registro, existente);
        return medidaRepository.save(existente);
    }

    @Transactional
    public void deletarMedida(Long id, Usuario usuario) {
        MedidaCorporal existente = medidaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de medidas não encontrado."));
        medidaRepository.delete(existente);
    }

    public List<FotoProgresso> listarFotos(Usuario usuario) {
        return fotoRepository.findByUsuarioIdOrderByDataAscIdAsc(usuario.getId());
    }

    @Transactional
    public FotoProgresso salvarFoto(FotoProgresso foto, Usuario usuario) {
        foto.setUsuario(usuario);
        return fotoRepository.save(foto);
    }

    @Transactional
    public FotoProgresso atualizarFoto(Long id, FotoProgresso foto, Usuario usuario) {
        FotoProgresso existente = fotoRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Foto de progresso não encontrada."));

        existente.setData(foto.getData());
        existente.setSrc(foto.getSrc());
        return fotoRepository.save(existente);
    }

    @Transactional
    public void deletarFoto(Long id, Usuario usuario) {
        FotoProgresso existente = fotoRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Foto de progresso não encontrada."));
        fotoRepository.delete(existente);
    }

    private void copiarMedidas(MedidaCorporal origem, MedidaCorporal destino) {
        destino.setData(origem.getData());
        destino.setCintura(origem.getCintura());
        destino.setBraco(origem.getBraco());
        destino.setPerna(origem.getPerna());
        destino.setGordura(origem.getGordura());
    }

    private void validarPeso(Double peso) {
        if (peso == null || peso < 20 || peso > 300) {
            throw new IllegalArgumentException("Peso deve estar entre 20 e 300 kg.");
        }
    }

    private void validarMedidas(MedidaCorporal registro) {
        validarFaixa(registro.getCintura(), 30, 200, "Cintura");
        validarFaixa(registro.getBraco(), 10, 80, "Braço");
        validarFaixa(registro.getPerna(), 20, 100, "Perna");
        validarFaixa(registro.getGordura(), 2, 70, "Gordura corporal");

        if (registro.getCintura() == null
                && registro.getBraco() == null
                && registro.getPerna() == null
                && registro.getGordura() == null) {
            throw new IllegalArgumentException("Informe ao menos uma medida.");
        }
    }

    private void validarFaixa(Double valor, double min, double max, String rotulo) {
        if (valor != null && (valor < min || valor > max)) {
            throw new IllegalArgumentException(rotulo + " deve estar entre " + min + " e " + max + ".");
        }
    }
}
