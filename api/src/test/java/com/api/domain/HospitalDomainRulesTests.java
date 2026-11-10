package com.api.domain;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.model.Consulta;
import com.api.domain.model.Internacao;
import com.api.domain.model.Paciente;
import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.Quarto;
import com.api.domain.model.enums.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class HospitalDomainRulesTests {

    private Paciente paciente;
    private ProfissionalSaude clinico;
    private ProfissionalSaude cardiologista;
    private ProfissionalSaude cirurgiao;
    private Quarto quartoIndividual;

    @BeforeEach
    void setUp() {
        paciente = new Paciente("Carlos Silva", "123.456.789-00", LocalDate.of(1990, 5, 20), "31999998888", "Rua A", "carlos@test.com");
        clinico = new ProfissionalSaude("Dra. Paula", "CRM 1234", "3133334444", "paula@hospital.com", CategoriaProfissional.CLINICO_GERAL, null, null);
        cardiologista = new ProfissionalSaude("Dr. Lucas", "CRM 5678", "3133335555", "lucas@hospital.com", CategoriaProfissional.ESPECIALISTA, "Cardiologia", null);
        cirurgiao = new ProfissionalSaude("Dr. Marcos", "CRM 9999", "3133336666", "marcos@hospital.com", CategoriaProfissional.CIRURGIAO, null, "Cirurgia Geral");
        quartoIndividual = new Quarto(101, 1, 1, TipoQuarto.INDIVIDUAL);
    }

    @Test
    @DisplayName("Cirurgião deve possuir descrição de atuação cirúrgica")
    void deveExigirAtuacaoCirurgicaParaCirurgiao() {
        assertThrows(BusinessRuleException.class, () -> 
            new ProfissionalSaude("Dr. Teste", "CRM 0001", "3199999999", "t@t.com", CategoriaProfissional.CIRURGIAO, null, null)
        );
    }

    @Test
    @DisplayName("Especialista deve possuir especialidade informada")
    void deveExigirEspecialidadeParaMedicoEspecialista() {
        assertThrows(BusinessRuleException.class, () -> 
            new ProfissionalSaude("Dr. Teste", "CRM 0002", "3199999999", "t@t.com", CategoriaProfissional.ESPECIALISTA, null, null)
        );
    }

    @Test
    @DisplayName("Consulta especializada deve falhar se o médico não tiver a especialidade requerida")
    void deveRejeitarConsultaEspecializadaComMedicoIncompativel() {
        Consulta consulta = new Consulta(paciente, clinico, LocalDate.now(), LocalTime.of(10, 0), "Exame cardíaco", ModalidadeAtendimento.ESPECIALIZADA);
        consulta.setEspecialidadeRequerida("Cardiologia");

        assertThrows(BusinessRuleException.class, consulta::validarRegrasModalidade);
    }

    @Test
    @DisplayName("Consulta especializada deve ser aceita se a especialidade do médico for compatível")
    void deveAceitarConsultaEspecializadaComMedicoCompativel() {
        Consulta consulta = new Consulta(paciente, cardiologista, LocalDate.now(), LocalTime.of(10, 0), "Exame cardíaco", ModalidadeAtendimento.ESPECIALIZADA);
        consulta.setEspecialidadeRequerida("Cardiologia");

        assertDoesNotThrow(consulta::validarRegrasModalidade);
    }

    @Test
    @DisplayName("Procedimento cirúrgico exige um profissional cirurgião")
    void deveExigirCirurgiaoParaProcedimentoCirurgico() {
        Consulta procedimento = new Consulta(paciente, clinico, LocalDate.now(), LocalTime.of(8, 0), "Cirurgia", ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO);
        assertThrows(BusinessRuleException.class, procedimento::validarRegrasModalidade);
    }

    @Test
    @DisplayName("Não deve permitir registrar procedimento cirúrgico como concluído sem ter sido iniciado")
    void naoDeveConcluirProcedimentoCirurgicoNaoIniciado() {
        Consulta procedimento = new Consulta(paciente, cirurgiao, LocalDate.now(), LocalTime.of(8, 0), "Apendicectomia", ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO);
        procedimento.setTipoCirurgia("Apendicectomia");
        procedimento.setDescricaoProcedimento("Cirurgia de remoção");

        // Situação inicial: AGENDADO
        assertEquals(SituacaoProcedimento.AGENDADO, procedimento.getSituacaoProcedimento());

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () ->
            procedimento.concluir("Procedimento finalizado com sucesso")
        );
        assertTrue(exception.getMessage().contains("Não será permitido registrar um procedimento como concluído se ele não tiver sido iniciado"));
    }

    @Test
    @DisplayName("Deve permitir concluir procedimento cirúrgico após ele ter sido iniciado")
    void deveConcluirProcedimentoCirurgicoAposIniciado() {
        Consulta procedimento = new Consulta(paciente, cirurgiao, LocalDate.now(), LocalTime.of(8, 0), "Apendicectomia", ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO);
        procedimento.setTipoCirurgia("Apendicectomia");
        procedimento.setDescricaoProcedimento("Cirurgia de remoção");

        procedimento.iniciarAtendimento();
        assertEquals(SituacaoProcedimento.EM_ANDAMENTO, procedimento.getSituacaoProcedimento());

        procedimento.concluir("Sem intercorrências.");
        assertEquals(SituacaoProcedimento.CONCLUIDO, procedimento.getSituacaoProcedimento());
        assertEquals(SituacaoConsulta.CONCLUIDA, procedimento.getSituacao());
    }

    @Test
    @DisplayName("Consulta concluída não deve voltar para a situação agendada")
    void consultaConcluidaNaoPodeVoltarParaAgendada() {
        Consulta consulta = new Consulta(paciente, clinico, LocalDate.now(), LocalTime.of(14, 0), "Consulta de rotina", ModalidadeAtendimento.ROTINA);
        consulta.iniciarAtendimento();
        consulta.concluir("Tudo ok");

        assertEquals(SituacaoConsulta.CONCLUIDA, consulta.getSituacao());

        assertThrows(BusinessRuleException.class, () -> consulta.cancelar("Tentando cancelar"));
    }

    @Test
    @DisplayName("Consulta cancelada não pode ser concluída")
    void consultaCanceladaNaoPodeSerConcluida() {
        Consulta consulta = new Consulta(paciente, clinico, LocalDate.now(), LocalTime.of(14, 0), "Consulta de rotina", ModalidadeAtendimento.ROTINA);
        consulta.cancelar("Paciente cancelou por telefone");

        assertThrows(BusinessRuleException.class, () -> consulta.concluir("Finalizando"));
    }

    @Test
    @DisplayName("Quarto não deve permitir ocupação acima da capacidade máxima")
    void quartoNaoDevePermitirOcupacaoAcimaDaCapacidade() {
        assertTrue(quartoIndividual.verificarDisponibilidade());
        quartoIndividual.adicionarOcupante();

        assertFalse(quartoIndividual.verificarDisponibilidade());
        assertEquals(SituacaoQuarto.OCUPADO, quartoIndividual.getSituacao());

        assertThrows(BusinessRuleException.class, quartoIndividual::adicionarOcupante);
    }

    @Test
    @DisplayName("Internação deve alocar quarto e alta deve liberar vaga")
    void internacaoDeveOcuparELiberarQuartoNaAlta() {
        Internacao internacao = new Internacao(paciente, clinico, quartoIndividual, LocalDateTime.now(), null, "Observação");
        assertEquals(1, quartoIndividual.getQuantidadeOcupantes());
        assertEquals(SituacaoQuarto.OCUPADO, quartoIndividual.getSituacao());

        internacao.registrarAlta("Paciente recuperado");
        assertFalse(internacao.isAtiva());
        assertNotNull(internacao.getDataEfetivaAlta());
        assertEquals(0, quartoIndividual.getQuantidadeOcupantes());
        assertEquals(SituacaoQuarto.DISPONIVEL, quartoIndividual.getSituacao());
    }
}
