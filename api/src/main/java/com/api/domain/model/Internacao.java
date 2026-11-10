package com.api.domain.model;

import com.api.domain.exception.BusinessRuleException;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internacoes")
public class Internacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "profissional_id", nullable = false)
    private ProfissionalSaude profissionalResponsavel;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    @Column(name = "data_entrada", nullable = false)
    private LocalDateTime dataEntrada;

    @Column(name = "data_prevista_alta")
    private LocalDateTime dataPrevistaAlta;

    @Column(name = "data_efetiva_alta")
    private LocalDateTime dataEfetivaAlta;

    @Column(length = 500)
    private String observacoes;

    @Column(nullable = false)
    private boolean ativa = true;

    public Internacao() {
    }

    public Internacao(Paciente paciente, ProfissionalSaude profissionalResponsavel, Quarto quarto,
                      LocalDateTime dataEntrada, LocalDateTime dataPrevistaAlta, String observacoes) {
        if (!quarto.verificarDisponibilidade()) {
            throw new BusinessRuleException("Não é possível internar o paciente: o quarto selecionado não possui vagas disponíveis.");
        }
        this.paciente = paciente;
        this.profissionalResponsavel = profissionalResponsavel;
        this.quarto = quarto;
        this.dataEntrada = dataEntrada != null ? dataEntrada : LocalDateTime.now();
        this.dataPrevistaAlta = dataPrevistaAlta;
        this.observacoes = observacoes;
        this.ativa = true;
        this.quarto.adicionarOcupante();
    }

    public void registrarAlta(String observacoesAlta) {
        if (!this.ativa || this.dataEfetivaAlta != null) {
            throw new BusinessRuleException("Esta internação já foi finalizada anteriormente.");
        }
        this.dataEfetivaAlta = LocalDateTime.now();
        this.ativa = false;
        if (observacoesAlta != null && !observacoesAlta.trim().isEmpty()) {
            this.observacoes = (this.observacoes != null ? this.observacoes + " | Alta: " : "Alta: ") + observacoesAlta;
        }
        this.quarto.removerOcupante();
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

    public ProfissionalSaude getProfissionalResponsavel() {
        return profissionalResponsavel;
    }

    public void setProfissionalResponsavel(ProfissionalSaude profissionalResponsavel) {
        this.profissionalResponsavel = profissionalResponsavel;
    }

    public Quarto getQuarto() {
        return quarto;
    }

    public void setQuarto(Quarto quarto) {
        this.quarto = quarto;
    }

    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDateTime dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public LocalDateTime getDataPrevistaAlta() {
        return dataPrevistaAlta;
    }

    public void setDataPrevistaAlta(LocalDateTime dataPrevistaAlta) {
        this.dataPrevistaAlta = dataPrevistaAlta;
    }

    public LocalDateTime getDataEfetivaAlta() {
        return dataEfetivaAlta;
    }

    public void setDataEfetivaAlta(LocalDateTime dataEfetivaAlta) {
        this.dataEfetivaAlta = dataEfetivaAlta;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }
}

