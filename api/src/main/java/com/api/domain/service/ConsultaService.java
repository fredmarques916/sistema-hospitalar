package com.api.domain.service;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.exception.ResourceNotFoundException;
import com.api.domain.model.Consulta;
import com.api.domain.model.Paciente;
import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.enums.ModalidadeAtendimento;
import com.api.domain.model.enums.SituacaoConsulta;
import com.api.domain.model.enums.StatusEmergencia;
import com.api.domain.repository.ConsultaRepository;
import com.api.dto.request.AtualizarSituacaoConsultaRequest;
import com.api.dto.request.ConsultaRequest;
import com.api.dto.response.ConsultaResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteService pacienteService;
    private final ProfissionalSaudeService profissionalService;

    public ConsultaService(ConsultaRepository consultaRepository,
                           PacienteService pacienteService,
                           ProfissionalSaudeService profissionalService) {
        this.consultaRepository = consultaRepository;
        this.pacienteService = pacienteService;
        this.profissionalService = profissionalService;
    }

    public List<ConsultaResponse> listarTodas(SituacaoConsulta situacao,
                                              ModalidadeAtendimento modalidade,
                                              Long pacienteId,
                                              LocalDate dataConsulta,
                                              StatusEmergencia statusEmergencia) {
        List<Consulta> lista;
        if (modalidade == ModalidadeAtendimento.EMERGENCIA && statusEmergencia != null) {
            lista = consultaRepository.findByModalidadeAndStatusEmergencia(ModalidadeAtendimento.EMERGENCIA, statusEmergencia);
        } else if (situacao != null) {
            lista = consultaRepository.findBySituacao(situacao);
        } else if (modalidade != null) {
            lista = consultaRepository.findByModalidade(modalidade);
        } else if (pacienteId != null) {
            lista = consultaRepository.findByPacienteId(pacienteId);
        } else if (dataConsulta != null) {
            lista = consultaRepository.findByDataConsulta(dataConsulta);
        } else {
            lista = consultaRepository.findAll();
        }
        return lista.stream().map(ConsultaResponse::from).toList();
    }

    public ConsultaResponse buscarPorId(Long id) {
        return ConsultaResponse.from(buscarEntidadePorId(id));
    }

    public Consulta buscarEntidadePorId(Long id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta com ID " + id + " não encontrada."));
    }

    @Transactional
    public ConsultaResponse agendarConsulta(ConsultaRequest request) {
        Paciente paciente = pacienteService.buscarEntidadePorId(request.pacienteId());
        ProfissionalSaude profissional = profissionalService.buscarEntidadePorId(request.profissionalId());

        Consulta consulta = new Consulta(
                paciente,
                profissional,
                request.dataConsulta(),
                request.horario(),
                request.motivo(),
                request.modalidade()
        );

        consulta.setObservacoes(request.observacoes());

        // Configuração de acordo com a modalidade
        if (request.modalidade() == ModalidadeAtendimento.ESPECIALIZADA) {
            consulta.setEspecialidadeRequerida(request.especialidadeRequerida());
        } else if (request.modalidade() == ModalidadeAtendimento.EMERGENCIA) {
            if (request.prioridadeEmergencia() != null) {
                consulta.setPrioridadeEmergencia(request.prioridadeEmergencia());
            }
        } else if (request.modalidade() == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            consulta.setTipoCirurgia(request.tipoCirurgia());
            consulta.setDescricaoProcedimento(request.descricaoProcedimento());
            if (request.dataHoraPrevista() != null) {
                consulta.setDataHoraPrevista(request.dataHoraPrevista());
            }
            consulta.setObservacoesPreOperatorias(request.observacoesPreOperatorias());
            consulta.setObservacoesPosOperatorias(request.observacoesPosOperatorias());
        }

        consulta.validarRegrasModalidade();
        Consulta salva = consultaRepository.save(consulta);

        return ConsultaResponse.from(salva);
    }

    @Transactional
    public ConsultaResponse atualizarSituacao(Long id, AtualizarSituacaoConsultaRequest request) {
        Consulta consulta = buscarEntidadePorId(id);

        switch (request.novaSituacao()) {
            case CONFIRMADA -> consulta.confirmar();
            case EM_ATENDIMENTO -> consulta.iniciarAtendimento();
            case CONCLUIDA -> consulta.concluir(request.observacoes());
            case CANCELADA -> consulta.cancelar(request.observacoes());
            case NAO_COMPARECEU -> consulta.registrarNaoCompareceu();
            case AGENDADA -> {
                if (consulta.getSituacao() == SituacaoConsulta.CONCLUIDA) {
                    throw new BusinessRuleException("Uma consulta já concluída não pode voltar a ser considerada agendada.");
                }
                consulta.setSituacao(SituacaoConsulta.AGENDADA);
            }
        }

        if (request.observacoes() != null && !request.observacoes().trim().isEmpty() 
                && request.novaSituacao() != SituacaoConsulta.CONCLUIDA 
                && request.novaSituacao() != SituacaoConsulta.CANCELADA) {
            consulta.setObservacoes((consulta.getObservacoes() != null ? consulta.getObservacoes() + " | " : "") + request.observacoes());
        }

        Consulta atualizada = consultaRepository.save(consulta);
        return ConsultaResponse.from(atualizada);
    }

    @Transactional
    public void excluir(Long id) {
        Consulta consulta = buscarEntidadePorId(id);
        if (consulta.getSituacao() == SituacaoConsulta.CONCLUIDA) {
            throw new BusinessRuleException("Não é permitido excluir uma consulta que já foi concluída.");
        }
        consultaRepository.delete(consulta);
    }
}

