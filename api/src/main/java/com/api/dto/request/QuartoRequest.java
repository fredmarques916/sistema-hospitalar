package com.api.dto.request;

import com.api.domain.model.enums.TipoQuarto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuartoRequest(
    @NotNull(message = "O número de identificação do quarto é obrigatório")
    Integer numeroIdentificacao,

    @NotNull(message = "O andar do quarto é obrigatório")
    Integer andar,

    @NotNull(message = "A capacidade máxima é obrigatória")
    @Min(value = 1, message = "A capacidade máxima deve ser de no mínimo 1 paciente")
    Integer capacidadeMaxima,

    @NotNull(message = "O tipo do quarto é obrigatório (INDIVIDUAL, ENFERMARIA, UTI)")
    TipoQuarto tipoQuarto
) {}

