package com.api.domain.repository;

import com.api.domain.model.Consulta;
import com.api.domain.model.enums.ModalidadeAtendimento;
import com.api.domain.model.enums.SituacaoConsulta;
import com.api.domain.model.enums.StatusEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findBySituacao(SituacaoConsulta situacao);
    List<Consulta> findByModalidade(ModalidadeAtendimento modalidade);
    List<Consulta> findByPacienteId(Long pacienteId);
    List<Consulta> findByProfissionalId(Long profissionalId);
    List<Consulta> findByDataConsulta(LocalDate dataConsulta);
    List<Consulta> findByModalidadeAndStatusEmergencia(ModalidadeAtendimento modalidade, StatusEmergencia statusEmergencia);
}
