package com.api.domain.model;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "consultas")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "profissional_id", nullable = false)
    private ProfissionalSaude profissional;

    @Column(name = "data_consulta", nullable = false)
    private LocalDate dataConsulta;

    @Column(nullable = false)
    private LocalTime horario;

    @Column(nullable = false, length = 255)
    private String motivo;

    @Column(length = 1000)
    private String observacoes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ModalidadeAtendimento modalidade = ModalidadeAtendimento.ROTINA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SituacaoConsulta situacao = SituacaoConsulta.AGENDADA;

    // Específico para Modalidade Especializada
    @Column(name = "especialidade_requerida", length = 100)
    private String especialidadeRequerida;

    // Específico para Emergência
    @Enumerated(EnumType.STRING)
    @Column(name = "prioridade_emergencia", length = 30)
    private PrioridadeEmergencia prioridadeEmergencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_emergencia", length = 30)
    private StatusEmergencia statusEmergencia;

    // Específico para Procedimento Cirúrgico
    @Column(name = "tipo_cirurgia", length = 100)
    private String tipoCirurgia;

    @Column(name = "descricao_procedimento", length = 500)
    private String descricaoProcedimento;

    @Column(name = "data_hora_prevista")
    private LocalDateTime dataHoraPrevista;

    @Column(name = "data_hora_efetiva")
    private LocalDateTime dataHoraEfetiva;

    @Column(name = "obs_pre_operatorias", length = 500)
    private String observacoesPreOperatorias;

    @Column(name = "obs_pos_operatorias", length = 500)
    private String observacoesPosOperatorias;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao_procedimento", length = 30)
    private SituacaoProcedimento situacaoProcedimento;

    public Consulta() {
    }

    public Consulta(Paciente paciente, ProfissionalSaude profissional, LocalDate dataConsulta, LocalTime horario,
                    String motivo, ModalidadeAtendimento modalidade) {
        this.paciente = paciente;
        this.profissional = profissional;
        this.dataConsulta = dataConsulta;
        this.horario = horario;
        this.motivo = motivo;
        this.modalidade = modalidade != null ? modalidade : ModalidadeAtendimento.ROTINA;
        this.situacao = SituacaoConsulta.AGENDADA;

        if (this.modalidade == ModalidadeAtendimento.EMERGENCIA) {
            this.prioridadeEmergencia = PrioridadeEmergencia.MODERADA;
            this.statusEmergencia = StatusEmergencia.AGUARDANDO_AVALIACAO;
        } else if (this.modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            this.situacaoProcedimento = SituacaoProcedimento.AGENDADO;
            if (dataConsulta != null && horario != null) {
                this.dataHoraPrevista = LocalDateTime.of(dataConsulta, horario);
            }
        }
    }

    public void validarRegrasModalidade() {
        if (modalidade == ModalidadeAtendimento.ESPECIALIZADA) {
            if (especialidadeRequerida == null || especialidadeRequerida.trim().isEmpty()) {
                throw new BusinessRuleException("Consulta especializada exige a definição da especialidade requerida.");
            }
            if (profissional == null || !profissional.isCompativelComEspecialidade(especialidadeRequerida)) {
                String espMedico = (profissional != null) ? profissional.getEspecialidade() : "Nenhum";
                throw new BusinessRuleException("O profissional selecionado (" + (profissional != null ? profissional.getNome() : "") 
                        + " - " + espMedico + ") não possui a especialidade compatível com a solicitada: " + especialidadeRequerida);
            }
        } else if (modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            if (profissional == null || !profissional.isCirurgiao()) {
                throw new BusinessRuleException("Procedimento cirúrgico exige um profissional cirurgião responsável habilitado.");
            }
        }
    }

    public void confirmar() {
        if (situacao != SituacaoConsulta.AGENDADA) {
            throw new BusinessRuleException("Somente uma consulta agendada pode ser confirmada.");
        }
        this.situacao = SituacaoConsulta.CONFIRMADA;
    }

    public void iniciarAtendimento() {
        if (situacao != SituacaoConsulta.AGENDADA && situacao != SituacaoConsulta.CONFIRMADA) {
            throw new BusinessRuleException("Somente uma consulta agendada ou confirmada pode iniciar atendimento.");
        }
        this.situacao = SituacaoConsulta.EM_ATENDIMENTO;

        if (modalidade == ModalidadeAtendimento.EMERGENCIA) {
            this.statusEmergencia = StatusEmergencia.EM_ANDAMENTO;
        }
        if (modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            this.situacaoProcedimento = SituacaoProcedimento.EM_ANDAMENTO;
            this.dataHoraEfetiva = LocalDateTime.now();
        }
    }

    public void concluir(String observacoesFinais) {
        if (situacao == SituacaoConsulta.CONCLUIDA) {
            throw new BusinessRuleException("Esta consulta já está concluída.");
        }
        if (situacao == SituacaoConsulta.CANCELADA) {
            throw new BusinessRuleException("Não é permitido concluir uma consulta cancelada sem que exista um novo agendamento.");
        }
        if (modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            if (this.situacaoProcedimento != SituacaoProcedimento.EM_ANDAMENTO) {
                throw new BusinessRuleException("Não será permitido registrar um procedimento como concluído se ele não tiver sido iniciado.");
            }
        }
        if (situacao != SituacaoConsulta.EM_ATENDIMENTO) {
            throw new BusinessRuleException("Somente uma consulta em atendimento pode ser concluída.");
        }
        if (modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            this.situacaoProcedimento = SituacaoProcedimento.CONCLUIDO;
            if (this.dataHoraEfetiva == null) {
                this.dataHoraEfetiva = LocalDateTime.now();
            }
        }
        this.situacao = SituacaoConsulta.CONCLUIDA;
        if (modalidade == ModalidadeAtendimento.EMERGENCIA) {
            this.statusEmergencia = StatusEmergencia.CONCLUIDO;
        }
        if (observacoesFinais != null && !observacoesFinais.trim().isEmpty()) {
            this.observacoes = (this.observacoes != null ? this.observacoes + " | Conclusão: " : "Conclusão: ") + observacoesFinais;
        }
    }

    public void cancelar(String motivoCancelamento) {
        if (situacao == SituacaoConsulta.CONCLUIDA) {
            throw new BusinessRuleException("Uma consulta já concluída não pode ser cancelada nem voltar para agendada.");
        }
        if (situacao != SituacaoConsulta.AGENDADA
                && situacao != SituacaoConsulta.CONFIRMADA
                && situacao != SituacaoConsulta.EM_ATENDIMENTO) {
            throw new BusinessRuleException("Somente uma consulta agendada, confirmada ou em atendimento pode ser cancelada.");
        }
        if (modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO && situacaoProcedimento == SituacaoProcedimento.CONCLUIDO) {
            throw new BusinessRuleException("Procedimento cirúrgico concluído não pode ser cancelado.");
        }
        this.situacao = SituacaoConsulta.CANCELADA;
        if (modalidade == ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO) {
            this.situacaoProcedimento = SituacaoProcedimento.CANCELADO;
        }
        if (motivoCancelamento != null && !motivoCancelamento.trim().isEmpty()) {
            this.observacoes = (this.observacoes != null ? this.observacoes + " | Cancelamento: " : "Cancelamento: ") + motivoCancelamento;
        }
    }

    public void registrarNaoCompareceu() {
        if (situacao != SituacaoConsulta.AGENDADA && situacao != SituacaoConsulta.CONFIRMADA) {
            throw new BusinessRuleException("Não comparecimento só pode ser registrado para consultas agendadas ou confirmadas.");
        }
        this.situacao = SituacaoConsulta.NAO_COMPARECEU;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public ProfissionalSaude getProfissional() {
        return profissional;
    }

    public void setProfissional(ProfissionalSaude profissional) {
        this.profissional = profissional;
    }

    public LocalDate getDataConsulta() {
        return dataConsulta;
    }

    public void setDataConsulta(LocalDate dataConsulta) {
        this.dataConsulta = dataConsulta;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public ModalidadeAtendimento getModalidade() {
        return modalidade;
    }

    public void setModalidade(ModalidadeAtendimento modalidade) {
        this.modalidade = modalidade;
    }

    public SituacaoConsulta getSituacao() {
        return situacao;
    }

    public void setSituacao(SituacaoConsulta situacao) {
        this.situacao = situacao;
    }

    public String getEspecialidadeRequerida() {
        return especialidadeRequerida;
    }

    public void setEspecialidadeRequerida(String especialidadeRequerida) {
        this.especialidadeRequerida = especialidadeRequerida;
    }

    public PrioridadeEmergencia getPrioridadeEmergencia() {
        return prioridadeEmergencia;
    }

    public void setPrioridadeEmergencia(PrioridadeEmergencia prioridadeEmergencia) {
        this.prioridadeEmergencia = prioridadeEmergencia;
    }

    public StatusEmergencia getStatusEmergencia() {
        return statusEmergencia;
    }

    public void setStatusEmergencia(StatusEmergencia statusEmergencia) {
        this.statusEmergencia = statusEmergencia;
    }

    public String getTipoCirurgia() {
        return tipoCirurgia;
    }

    public void setTipoCirurgia(String tipoCirurgia) {
        this.tipoCirurgia = tipoCirurgia;
    }

    public String getDescricaoProcedimento() {
        return descricaoProcedimento;
    }

    public void setDescricaoProcedimento(String descricaoProcedimento) {
        this.descricaoProcedimento = descricaoProcedimento;
    }

    public LocalDateTime getDataHoraPrevista() {
        return dataHoraPrevista;
    }

    public void setDataHoraPrevista(LocalDateTime dataHoraPrevista) {
        this.dataHoraPrevista = dataHoraPrevista;
    }

    public LocalDateTime getDataHoraEfetiva() {
        return dataHoraEfetiva;
    }

    public void setDataHoraEfetiva(LocalDateTime dataHoraEfetiva) {
        this.dataHoraEfetiva = dataHoraEfetiva;
    }

    public String getObservacoesPreOperatorias() {
        return observacoesPreOperatorias;
    }

    public void setObservacoesPreOperatorias(String observacoesPreOperatorias) {
        this.observacoesPreOperatorias = observacoesPreOperatorias;
    }

    public String getObservacoesPosOperatorias() {
        return observacoesPosOperatorias;
    }

    public void setObservacoesPosOperatorias(String observacoesPosOperatorias) {
        this.observacoesPosOperatorias = observacoesPosOperatorias;
    }

    public SituacaoProcedimento getSituacaoProcedimento() {
        return situacaoProcedimento;
    }

    public void setSituacaoProcedimento(SituacaoProcedimento situacaoProcedimento) {
        this.situacaoProcedimento = situacaoProcedimento;
    }
}
