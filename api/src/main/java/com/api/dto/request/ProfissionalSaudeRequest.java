package com.api.dto.request;

import com.api.domain.model.enums.CategoriaProfissional;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProfissionalSaudeRequest(
    @NotBlank(message = "O nome do profissional é obrigatório")
    String nome,

    @NotBlank(message = "O registro profissional (CRM/etc) é obrigatório")
    String registroProfissional,

    String telefone,
    String email,

    @NotNull(message = "A categoria profissional é obrigatória (CLINICO_GERAL, ESPECIALISTA, CIRURGIAO)")
    CategoriaProfissional categoria,

    String especialidade,
    String atuacaoCirurgica
) {}
