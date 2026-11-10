package com.api.domain.repository;

import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.enums.CategoriaProfissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfissionalSaudeRepository extends JpaRepository<ProfissionalSaude, Long> {
    Optional<ProfissionalSaude> findByRegistroProfissional(String registroProfissional);
    boolean existsByRegistroProfissional(String registroProfissional);
    List<ProfissionalSaude> findByCategoria(CategoriaProfissional categoria);
    List<ProfissionalSaude> findByEspecialidadeIgnoreCase(String especialidade);
}

