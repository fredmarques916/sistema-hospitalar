package com.api.dto.response;

import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.enums.CategoriaProfissional;

public record ProfissionalSaudeResponse(
    Long id,
    String nome,
    String registroProfissional,
    String telefone,
    String email,
    CategoriaProfissional categoria,
    String especialidade,
    String atuacaoCirurgica
) {
    public static ProfissionalSaudeResponse from(ProfissionalSaude profissional) {
        return new ProfissionalSaudeResponse(
            profissional.getId(),
            profissional.getNome(),
            profissional.getRegistroProfissional(),
            profissional.getTelefone(),
            profissional.getEmail(),
            profissional.getCategoria(),
            profissional.getEspecialidade(),
            profissional.getAtuacaoCirurgica()
        );
    }
}

