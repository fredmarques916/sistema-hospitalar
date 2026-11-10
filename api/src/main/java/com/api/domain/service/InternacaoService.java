package com.api.domain.service;

import com.api.domain.exception.ResourceNotFoundException;
import com.api.domain.model.Internacao;
import com.api.domain.model.Paciente;
import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.Quarto;
import com.api.domain.repository.InternacaoRepository;
import com.api.domain.repository.QuartoRepository;
import com.api.dto.request.InternacaoRequest;
import com.api.dto.request.RegistrarAltaRequest;
import com.api.dto.response.InternacaoResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class InternacaoService {

    private final InternacaoRepository internacaoRepository;
    private final PacienteService pacienteService;
    private final ProfissionalSaudeService profissionalService;
    private final QuartoService quartoService;
    private final QuartoRepository quartoRepository;

    public InternacaoService(InternacaoRepository internacaoRepository,
                             PacienteService pacienteService,
                             ProfissionalSaudeService profissionalService,
                             QuartoService quartoService,
                             QuartoRepository quartoRepository) {
        this.internacaoRepository = internacaoRepository;
        this.pacienteService = pacienteService;
        this.profissionalService = profissionalService;
        this.quartoService = quartoService;
        this.quartoRepository = quartoRepository;
    }

    public List<InternacaoResponse> listarTodas(Boolean apenasAtivas, Long pacienteId) {
        List<Internacao> lista;
        if (Boolean.TRUE.equals(apenasAtivas)) {
            lista = internacaoRepository.findByAtivaTrue();
        } else if (pacienteId != null) {
            lista = internacaoRepository.findByPacienteId(pacienteId);
        } else {
            lista = internacaoRepository.findAll();
        }
        return lista.stream().map(InternacaoResponse::from).toList();
    }

    public InternacaoResponse buscarPorId(Long id) {
        return InternacaoResponse.from(buscarEntidadePorId(id));
    }

    public Internacao buscarEntidadePorId(Long id) {
        return internacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internação com ID " + id + " não encontrada."));
    }

    @Transactional
    public InternacaoResponse criarInternacao(InternacaoRequest request) {
        Paciente paciente = pacienteService.buscarEntidadePorId(request.pacienteId());
        ProfissionalSaude profissional = profissionalService.buscarEntidadePorId(request.profissionalId());
        Quarto quarto = quartoService.buscarEntidadePorId(request.quartoId());

        Internacao internacao = new Internacao(
                paciente,
                profissional,
                quarto,
                request.dataEntrada(),
                request.dataPrevistaAlta(),
                request.observacoes()
        );

        // Salva quarto atualizado com nova ocupação e internação
        quartoRepository.save(quarto);
        Internacao salva = internacaoRepository.save(internacao);

        return InternacaoResponse.from(salva);
    }

    @Transactional
    public InternacaoResponse registrarAlta(Long id, RegistrarAltaRequest request) {
        Internacao internacao = buscarEntidadePorId(id);
        String obsAlta = (request != null) ? request.observacoesAlta() : null;

        internacao.registrarAlta(obsAlta);

        quartoRepository.save(internacao.getQuarto());
        Internacao salva = internacaoRepository.save(internacao);

        return InternacaoResponse.from(salva);
    }
}
