package com.api.dto.response;

import com.api.domain.model.Internacao;
import java.time.LocalDateTime;

public record InternacaoResponse(
    Long id,
    PacienteResponse paciente,
    ProfissionalSaudeResponse profissionalResponsavel,
    QuartoResponse quarto,
    LocalDateTime dataEntrada,
    LocalDateTime dataPrevistaAlta,
    LocalDateTime dataEfetivaAlta,
    String observacoes,
    boolean ativa
) {
    public static InternacaoResponse from(Internacao internacao) {
        return new InternacaoResponse(
            internacao.getId(),
            PacienteResponse.from(internacao.getPaciente()),
            ProfissionalSaudeResponse.from(internacao.getProfissionalResponsavel()),
            QuartoResponse.from(internacao.getQuarto()),
            internacao.getDataEntrada(),
            internacao.getDataPrevistaAlta(),
            internacao.getDataEfetivaAlta(),
            internacao.getObservacoes(),
            internacao.isAtiva()
        );
    }
}

