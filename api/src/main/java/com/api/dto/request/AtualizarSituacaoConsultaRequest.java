package com.api.dto.request;

import com.api.domain.model.enums.SituacaoConsulta;
import jakarta.validation.constraints.NotNull;

public record AtualizarSituacaoConsultaRequest(
    @NotNull(message = "A nova situação da consulta é obrigatória")
    SituacaoConsulta novaSituacao,
    String observacoes
) {}

