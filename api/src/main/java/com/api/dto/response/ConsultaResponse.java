package com.api.dto.response;

import com.api.domain.model.Consulta;
import com.api.domain.model.enums.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ConsultaResponse(
    Long id,
    PacienteResponse paciente,
    ProfissionalSaudeResponse profissional,
    LocalDate dataConsulta,
    LocalTime horario,
    String motivo,
    String observacoes,
    ModalidadeAtendimento modalidade,
    SituacaoConsulta situacao,
    String especialidadeRequerida,
    PrioridadeEmergencia prioridadeEmergencia,
    StatusEmergencia statusEmergencia,
    String tipoCirurgia,
    String descricaoProcedimento,
    LocalDateTime dataHoraPrevista,
    LocalDateTime dataHoraEfetiva,
    String observacoesPreOperatorias,
    String observacoesPosOperatorias,
    SituacaoProcedimento situacaoProcedimento
) {
    public static ConsultaResponse from(Consulta consulta) {
        return new ConsultaResponse(
            consulta.getId(),
            PacienteResponse.from(consulta.getPaciente()),
            ProfissionalSaudeResponse.from(consulta.getProfissional()),
            consulta.getDataConsulta(),
            consulta.getHorario(),
            consulta.getMotivo(),
            consulta.getObservacoes(),
            consulta.getModalidade(),
            consulta.getSituacao(),
            consulta.getEspecialidadeRequerida(),
            consulta.getPrioridadeEmergencia(),
            consulta.getStatusEmergencia(),
            consulta.getTipoCirurgia(),
            consulta.getDescricaoProcedimento(),
            consulta.getDataHoraPrevista(),
            consulta.getDataHoraEfetiva(),
            consulta.getObservacoesPreOperatorias(),
            consulta.getObservacoesPosOperatorias(),
            consulta.getSituacaoProcedimento()
        );
    }
}
