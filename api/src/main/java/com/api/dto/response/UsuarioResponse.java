package com.api.dto.response;

import com.api.domain.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String cargo
) {
    public static UsuarioResponse fromEntity(Usuario usuario) {
        if (usuario == null) return null;
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo()
        );
    }
}
