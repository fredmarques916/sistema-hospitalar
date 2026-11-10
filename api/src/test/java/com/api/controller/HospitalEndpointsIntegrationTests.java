package com.api.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class HospitalEndpointsIntegrationTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @DisplayName("GET /pacientes deve retornar 200 OK com lista de pacientes")
    void deveRetornarListaDePacientes() throws Exception {
        mockMvc.perform(get("/pacientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /profissionais deve retornar lista e permitir filtro por especialidade")
    void deveFiltrarProfissionaisPorEspecialidade() throws Exception {
        mockMvc.perform(get("/profissionais?especialidade=Cardiologia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].especialidade").value("Cardiologia"));
    }

    @Test
    @DisplayName("GET /quartos deve retornar 200 OK")
    void deveRetornarListaDeQuartos() throws Exception {
        mockMvc.perform(get("/quartos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /consultas deve retornar lista de consultas")
    void deveRetornarListaDeConsultas() throws Exception {
        mockMvc.perform(get("/consultas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /internacoes deve retornar lista de internacoes")
    void deveRetornarListaDeInternacoes() throws Exception {
        mockMvc.perform(get("/internacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
