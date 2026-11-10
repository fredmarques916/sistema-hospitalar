package com.api.domain.service;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.exception.ResourceNotFoundException;
import com.api.domain.model.Quarto;
import com.api.domain.model.enums.SituacaoQuarto;
import com.api.domain.model.enums.TipoQuarto;
import com.api.domain.repository.QuartoRepository;
import com.api.dto.request.QuartoRequest;
import com.api.dto.response.QuartoResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class QuartoService {

    private final QuartoRepository quartoRepository;

    public QuartoService(QuartoRepository quartoRepository) {
        this.quartoRepository = quartoRepository;
    }

    public List<QuartoResponse> listarTodos(SituacaoQuarto situacao, TipoQuarto tipoQuarto) {
        List<Quarto> lista;
        if (situacao != null) {
            lista = quartoRepository.findBySituacao(situacao);
        } else if (tipoQuarto != null) {
            lista = quartoRepository.findByTipoQuarto(tipoQuarto);
        } else {
            lista = quartoRepository.findAll();
        }
        return lista.stream().map(QuartoResponse::from).toList();
    }

    public QuartoResponse buscarPorId(Long id) {
        return QuartoResponse.from(buscarEntidadePorId(id));
    }

    public Quarto buscarEntidadePorId(Long id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto com ID " + id + " não encontrado."));
    }

    @Transactional
    public QuartoResponse cadastrar(QuartoRequest request) {
        if (quartoRepository.existsByNumeroIdentificacao(request.numeroIdentificacao())) {
            throw new BusinessRuleException("Já existe um quarto com o número: " + request.numeroIdentificacao());
        }

        Quarto quarto = new Quarto(
                request.numeroIdentificacao(),
                request.andar(),
                request.capacidadeMaxima(),
                request.tipoQuarto()
        );

        Quarto salvo = quartoRepository.save(quarto);
        return QuartoResponse.from(salvo);
    }

    @Transactional
    public QuartoResponse atualizar(Long id, QuartoRequest request) {
        Quarto quarto = buscarEntidadePorId(id);

        if (!quarto.getNumeroIdentificacao().equals(request.numeroIdentificacao())
                && quartoRepository.existsByNumeroIdentificacao(request.numeroIdentificacao())) {
            throw new BusinessRuleException("Já existe outro quarto com o número: " + request.numeroIdentificacao());
        }

        if (request.capacidadeMaxima() < quarto.getQuantidadeOcupantes()) {
            throw new BusinessRuleException("A nova capacidade máxima (" + request.capacidadeMaxima() 
                    + ") não pode ser menor que o número atual de pacientes internados (" + quarto.getQuantidadeOcupantes() + ").");
        }

        quarto.setNumeroIdentificacao(request.numeroIdentificacao());
        quarto.setAndar(request.andar());
        quarto.setCapacidadeMaxima(request.capacidadeMaxima());
        quarto.setTipoQuarto(request.tipoQuarto());
        quarto.atualizarSituacao();

        return QuartoResponse.from(quartoRepository.save(quarto));
    }

    @Transactional
    public void alterarSituacao(Long id, SituacaoQuarto novaSituacao) {
        Quarto quarto = buscarEntidadePorId(id);
        if (novaSituacao == SituacaoQuarto.MANUTENCAO && quarto.getQuantidadeOcupantes() > 0) {
            throw new BusinessRuleException("Não é possível colocar em manutenção um quarto com pacientes internados.");
        }
        quarto.setSituacao(novaSituacao);
        quartoRepository.save(quarto);
    }

    @Transactional
    public void excluir(Long id) {
        Quarto quarto = buscarEntidadePorId(id);
        if (quarto.getQuantidadeOcupantes() > 0) {
            throw new BusinessRuleException("Não é possível excluir um quarto com pacientes internados.");
        }
        quartoRepository.delete(quarto);
    }
}

