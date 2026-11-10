package com.api.config;

import com.api.domain.model.Consulta;
import com.api.domain.model.Internacao;
import com.api.domain.model.Paciente;
import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.Quarto;
import com.api.domain.model.enums.*;
import com.api.domain.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            PacienteRepository pacienteRepo,
            ProfissionalSaudeRepository profissionalRepo,
            QuartoRepository quartoRepo,
            InternacaoRepository internacaoRepo,
            ConsultaRepository consultaRepo) {
        return args -> {
            if (pacienteRepo.count() > 0) {
                return; // Já populado
            }

            // 1. Pacientes
            Paciente p1 = pacienteRepo.save(new Paciente("Maria da Silva", "111.222.333-44", LocalDate.of(1985, 4, 12), "(31) 98765-4321", "Rua das Flores, 120 - Belo Horizonte/MG", "maria.silva@email.com"));
            Paciente p2 = pacienteRepo.save(new Paciente("João Santos Pereira", "222.333.444-55", LocalDate.of(1990, 8, 25), "(31) 99123-8877", "Av. Brasil, 450 - Belo Horizonte/MG", "joao.santos@email.com"));
            Paciente p3 = pacienteRepo.save(new Paciente("Ana Beatriz Oliveira", "333.444.555-66", LocalDate.of(1978, 11, 3), "(31) 97654-1122", "Rua Bahia, 890 - Belo Horizonte/MG", "ana.oliveira@email.com"));
            Paciente p4 = pacienteRepo.save(new Paciente("Carlos Eduardo Souza", "444.555.666-77", LocalDate.of(2002, 1, 19), "(31) 98844-3322", "Rua Guajajaras, 301 - Belo Horizonte/MG", "carlos.souza@email.com"));

            // 2. Profissionais da Saúde (Clínico Geral, Especialista, Cirurgião)
            ProfissionalSaude clinico = profissionalRepo.save(new ProfissionalSaude(
                    "Dra. Camila Nogueira", "CRM/MG 45890", "(31) 3344-5566", "camila.nogueira@hospital.com",
                    CategoriaProfissional.CLINICO_GERAL, null, null));

            ProfissionalSaude cardio = profissionalRepo.save(new ProfissionalSaude(
                    "Dr. Roberto Drummond", "CRM/MG 31204", "(31) 3344-5577", "roberto.drummond@hospital.com",
                    CategoriaProfissional.ESPECIALISTA, "Cardiologia", null));

            ProfissionalSaude orto = profissionalRepo.save(new ProfissionalSaude(
                    "Dra. Letícia Rezende", "CRM/MG 52189", "(31) 3344-5588", "leticia.rezende@hospital.com",
                    CategoriaProfissional.ESPECIALISTA, "Ortopedia", null));

            ProfissionalSaude cirurgiao = profissionalRepo.save(new ProfissionalSaude(
                    "Dr. Fernando Albuquerque", "CRM/MG 29811", "(31) 3344-5599", "fernando.cirurgia@hospital.com",
                    CategoriaProfissional.CIRURGIAO, null, "Cirurgia Geral e Laparoscópica"));

            // 3. Quartos (Individual, Enfermaria, UTI)
            Quarto q101 = quartoRepo.save(new Quarto(101, 1, 1, TipoQuarto.INDIVIDUAL));
            Quarto q102 = quartoRepo.save(new Quarto(102, 1, 2, TipoQuarto.ENFERMARIA));
            Quarto q201 = quartoRepo.save(new Quarto(201, 2, 4, TipoQuarto.ENFERMARIA));
            Quarto q301 = quartoRepo.save(new Quarto(301, 3, 1, TipoQuarto.UTI));

            // 4. Internação de Maria da Silva no quarto 101
            Internacao internacao1 = new Internacao(p1, clinico, q101, LocalDateTime.now().minusDays(2), LocalDateTime.now().plusDays(2), "Paciente em observação pós-crise hipertensiva.");
            quartoRepo.save(q101);
            internacaoRepo.save(internacao1);

            // 5. Consultas
            // Rotina
            Consulta cRotina = new Consulta(p2, clinico, LocalDate.now().plusDays(1), LocalTime.of(14, 0), "Check-up preventivo anual", ModalidadeAtendimento.ROTINA);
            cRotina.setObservacoes("Paciente sem queixas agudas prévias.");
            consultaRepo.save(cRotina);

            // Especializada (Cardiologia com Dr. Roberto)
            Consulta cCardio = new Consulta(p3, cardio, LocalDate.now().plusDays(2), LocalTime.of(10, 30), "Avaliação de palpitações e teste ergométrico", ModalidadeAtendimento.ESPECIALIZADA);
            cCardio.setEspecialidadeRequerida("Cardiologia");
            consultaRepo.save(cCardio);

            // Emergência
            Consulta cEmerg = new Consulta(p4, clinico, LocalDate.now(), LocalTime.now().minusMinutes(30), "Dor torácica súbita e dispneia", ModalidadeAtendimento.EMERGENCIA);
            cEmerg.setPrioridadeEmergencia(PrioridadeEmergencia.ALTA);
            cEmerg.setStatusEmergencia(StatusEmergencia.EM_ANDAMENTO);
            cEmerg.setSituacao(SituacaoConsulta.EM_ATENDIMENTO);
            consultaRepo.save(cEmerg);

            // Procedimento Cirúrgico (com Dr. Fernando)
            Consulta cCirurgia = new Consulta(p1, cirurgiao, LocalDate.now().plusDays(5), LocalTime.of(8, 0), "Apendicectomia laparoscópica programada", ModalidadeAtendimento.PROCEDIMENTO_CIRURGICO);
            cCirurgia.setTipoCirurgia("Apendicectomia");
            cCirurgia.setDescricaoProcedimento("Remoção de apêndice via videolaparoscopia");
            cCirurgia.setDataHoraPrevista(LocalDateTime.of(LocalDate.now().plusDays(5), LocalTime.of(8, 0)));
            cCirurgia.setObservacoesPreOperatorias("Jejum de 8 horas prévio. Risco cirúrgico grau I.");
            consultaRepo.save(cCirurgia);
        };
    }
}
