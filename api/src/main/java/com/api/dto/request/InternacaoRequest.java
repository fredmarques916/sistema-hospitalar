package com.api.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record InternacaoRequest(
    @NotNull(message = "O ID do paciente é obrigatório")
    Long pacienteId,

    @NotNull(message = "O ID do profissional responsável é obrigatório")
    Long profissionalId,

    @NotNull(message = "O ID do quarto é obrigatório")
    Long quartoId,

    LocalDateTime dataEntrada,
    LocalDateTime dataPrevistaAlta,
    String observacoes
) {}
