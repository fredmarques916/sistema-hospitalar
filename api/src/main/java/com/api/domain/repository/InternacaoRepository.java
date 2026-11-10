package com.api.domain.repository;

import com.api.domain.model.Internacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternacaoRepository extends JpaRepository<Internacao, Long> {
    List<Internacao> findByAtivaTrue();
    List<Internacao> findByPacienteId(Long pacienteId);
    List<Internacao> findByQuartoId(Long quartoId);
    List<Internacao> findByProfissionalResponsavelId(Long profissionalId);
}
