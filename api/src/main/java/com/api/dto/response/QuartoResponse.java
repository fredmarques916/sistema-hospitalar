package com.api.dto.response;

import com.api.domain.model.Quarto;
import com.api.domain.model.enums.SituacaoQuarto;
import com.api.domain.model.enums.TipoQuarto;

public record QuartoResponse(
    Long id,
    Integer numeroIdentificacao,
    Integer andar,
    Integer capacidadeMaxima,
    Integer quantidadeOcupantes,
    TipoQuarto tipoQuarto,
    SituacaoQuarto situacao,
    boolean disponivel
) {
    public static QuartoResponse from(Quarto quarto) {
        return new QuartoResponse(
            quarto.getId(),
            quarto.getNumeroIdentificacao(),
            quarto.getAndar(),
            quarto.getCapacidadeMaxima(),
            quarto.getQuantidadeOcupantes(),
            quarto.getTipoQuarto(),
            quarto.getSituacao(),
            quarto.verificarDisponibilidade()
        );
    }
}

