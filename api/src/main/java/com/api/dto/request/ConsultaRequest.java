package com.api.dto.request;

import com.api.domain.model.enums.ModalidadeAtendimento;
import com.api.domain.model.enums.PrioridadeEmergencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ConsultaRequest(
    @NotNull(message = "O ID do paciente é obrigatório")
    Long pacienteId,

    @NotNull(message = "O ID do profissional responsável é obrigatório")
    Long profissionalId,

    @NotNull(message = "A data da consulta é obrigatória")
    LocalDate dataConsulta,

    @NotNull(message = "O horário da consulta é obrigatório")
    LocalTime horario,

    @NotBlank(message = "O motivo do atendimento é obrigatório")
    String motivo,

    String observacoes,

    @NotNull(message = "A modalidade do atendimento é obrigatória (ROTINA, ESPECIALIZADA, EMERGENCIA, PROCEDIMENTO_CIRURGICO)")
    ModalidadeAtendimento modalidade,

    // Para Especializada
    String especialidadeRequerida,

    // Para Emergência
    PrioridadeEmergencia prioridadeEmergencia,

    // Para Procedimento Cirúrgico
    String tipoCirurgia,
    String descricaoProcedimento,
    LocalDateTime dataHoraPrevista,
    String observacoesPreOperatorias,
    String observacoesPosOperatorias
) {}

