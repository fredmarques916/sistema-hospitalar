package com.api.domain.model;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.model.enums.SituacaoQuarto;
import com.api.domain.model.enums.TipoQuarto;
import jakarta.persistence.*;

@Entity
@Table(name = "quartos")
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_identificacao", nullable = false, unique = true)
    private Integer numeroIdentificacao;

    @Column(nullable = false)
    private Integer andar;

    @Column(name = "capacidade_maxima", nullable = false)
    private Integer capacidadeMaxima;

    @Column(name = "quantidade_ocupantes", nullable = false)
    private Integer quantidadeOcupantes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_quarto", nullable = false, length = 30)
    private TipoQuarto tipoQuarto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SituacaoQuarto situacao = SituacaoQuarto.DISPONIVEL;

    public Quarto() {
    }

    public Quarto(Integer numeroIdentificacao, Integer andar, Integer capacidadeMaxima, TipoQuarto tipoQuarto) {
        if (capacidadeMaxima == null || capacidadeMaxima <= 0) {
            throw new BusinessRuleException("A capacidade máxima do quarto deve ser maior que zero.");
        }
        if (tipoQuarto == TipoQuarto.INDIVIDUAL && capacidadeMaxima > 1) {
            throw new BusinessRuleException("Quarto individual deve possuir capacidade máxima de 1 paciente.");
        }
        this.numeroIdentificacao = numeroIdentificacao;
        this.andar = andar;
        this.capacidadeMaxima = capacidadeMaxima;
        this.tipoQuarto = tipoQuarto;
        this.quantidadeOcupantes = 0;
        this.situacao = SituacaoQuarto.DISPONIVEL;
    }

    public boolean verificarDisponibilidade() {
        return this.situacao != SituacaoQuarto.MANUTENCAO && this.quantidadeOcupantes < this.capacidadeMaxima;
    }

    public void adicionarOcupante() {
        if (!verificarDisponibilidade()) {
            throw new BusinessRuleException("Quarto não está disponível para nova ocupação. Capacidade máxima (" 
                    + capacidadeMaxima + ") atingida ou em manutenção.");
        }
        this.quantidadeOcupantes++;
        atualizarSituacao();
    }

    public void removerOcupante() {
        if (this.quantidadeOcupantes > 0) {
            this.quantidadeOcupantes--;
        }
        atualizarSituacao();
    }

    public void atualizarSituacao() {
        if (this.situacao == SituacaoQuarto.MANUTENCAO) {
            return;
        }
        if (this.quantidadeOcupantes >= this.capacidadeMaxima) {
            this.situacao = SituacaoQuarto.OCUPADO;
        } else {
            this.situacao = SituacaoQuarto.DISPONIVEL;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumeroIdentificacao() {
        return numeroIdentificacao;
    }

    public void setNumeroIdentificacao(Integer numeroIdentificacao) {
        this.numeroIdentificacao = numeroIdentificacao;
    }

    public Integer getAndar() {
        return andar;
    }

    public void setAndar(Integer andar) {
        this.andar = andar;
    }

    public Integer getCapacidadeMaxima() {
        return capacidadeMaxima;
    }

    public void setCapacidadeMaxima(Integer capacidadeMaxima) {
        this.capacidadeMaxima = capacidadeMaxima;
    }

    public Integer getQuantidadeOcupantes() {
        return quantidadeOcupantes;
    }

    public void setQuantidadeOcupantes(Integer quantidadeOcupantes) {
        this.quantidadeOcupantes = quantidadeOcupantes;
    }

    public TipoQuarto getTipoQuarto() {
        return tipoQuarto;
    }

    public void setTipoQuarto(TipoQuarto tipoQuarto) {
        this.tipoQuarto = tipoQuarto;
    }

    public SituacaoQuarto getSituacao() {
        return situacao;
    }

    public void setSituacao(SituacaoQuarto situacao) {
        this.situacao = situacao;
    }
}

