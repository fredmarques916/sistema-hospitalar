package com.api.domain.service;

import com.api.config.PasswordUtils;
import com.api.domain.exception.BusinessRuleException;
import com.api.domain.exception.ResourceNotFoundException;
import com.api.domain.model.Usuario;
import com.api.domain.repository.UsuarioRepository;
import com.api.dto.request.CadastroUsuarioRequest;
import com.api.dto.request.LoginRequest;
import com.api.dto.response.UsuarioResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public UsuarioResponse autenticar(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BusinessRuleException("Credenciais inválidas: e-mail ou senha incorretos."));

        if (!PasswordUtils.matches(request.senha(), usuario.getSenha())) {
            throw new BusinessRuleException("Credenciais inválidas: e-mail ou senha incorretos.");
        }

        return UsuarioResponse.fromEntity(usuario);
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroUsuarioRequest request) {
        String emailLimpo = request.email().trim().toLowerCase();

        if (usuarioRepository.existsByEmailIgnoreCase(emailLimpo)) {
            throw new BusinessRuleException("Já existe um usuário cadastrado com este e-mail.");
        }

        String senhaHasheada = PasswordUtils.hash(request.senha());
        String cargo = request.cargo() != null && !request.cargo().isBlank()
                ? request.cargo()
                : "Operador Clínico";

        Usuario novoUsuario = new Usuario(request.nome().trim(), emailLimpo, senhaHasheada, cargo);
        Usuario salvo = usuarioRepository.save(novoUsuario);

        return UsuarioResponse.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obterPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(UsuarioResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }
}
