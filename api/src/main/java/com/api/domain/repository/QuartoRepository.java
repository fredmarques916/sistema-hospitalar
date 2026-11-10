package com.api.domain.repository;

import com.api.domain.model.Quarto;
import com.api.domain.model.enums.SituacaoQuarto;
import com.api.domain.model.enums.TipoQuarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {
    Optional<Quarto> findByNumeroIdentificacao(Integer numeroIdentificacao);
    boolean existsByNumeroIdentificacao(Integer numeroIdentificacao);
    List<Quarto> findBySituacao(SituacaoQuarto situacao);
    List<Quarto> findByTipoQuarto(TipoQuarto tipoQuarto);
}

