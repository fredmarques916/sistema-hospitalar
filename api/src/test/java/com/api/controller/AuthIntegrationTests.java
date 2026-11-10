package com.api.controller;

import com.api.config.PasswordUtils;
import com.api.domain.model.Usuario;
import com.api.domain.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class AuthIntegrationTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        usuarioRepository.findByEmailIgnoreCase("residente.novo@hospital.com")
                .ifPresent(usuarioRepository::delete);

        if (!usuarioRepository.existsByEmailIgnoreCase("teste.auth@hospital.com")) {
            usuarioRepository.save(new Usuario(
                    "Usuário Teste",
                    "teste.auth@hospital.com",
                    PasswordUtils.hash("senhaSegura123"),
                    "Operador Clínico"
            ));
        }
    }

    @Test
    @DisplayName("Deve autenticar com sucesso quando e-mail e senha forem válidos")
    void deveAutenticarComSucesso() throws Exception {
        String json = """
                {
                    "email": "teste.auth@hospital.com",
                    "senha": "senhaSegura123"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("teste.auth@hospital.com"))
                .andExpect(jsonPath("$.nome").value("Usuário Teste"));
    }

    @Test
    @DisplayName("Deve rejeitar autenticação com senha incorreta")
    void deveRejeitarSenhaIncorreta() throws Exception {
        String json = """
                {
                    "email": "teste.auth@hospital.com",
                    "senha": "senhaErrada"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("Deve cadastrar novo usuário com persistência no banco de dados")
    void deveCadastrarNovoUsuario() throws Exception {
        String json = """
                {
                    "nome": "Novo Médico Residente",
                    "email": "residente.novo@hospital.com",
                    "senha": "senhaResidente123",
                    "cargo": "Médico Residente"
                }
                """;

        mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("residente.novo@hospital.com"))
                .andExpect(jsonPath("$.cargo").value("Médico Residente"));
    }

    @Test
    @DisplayName("Deve rejeitar cadastro com e-mail duplicado")
    void deveRejeitarEmailDuplicado() throws Exception {
        String json = """
                {
                    "nome": "Outro Usuário",
                    "email": "teste.auth@hospital.com",
                    "senha": "outraSenha123"
                }
                """;

        mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnprocessableEntity());
    }
}
