package com.api.domain.service;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.exception.ResourceNotFoundException;
import com.api.domain.model.ProfissionalSaude;
import com.api.domain.model.enums.CategoriaProfissional;
import com.api.domain.repository.ProfissionalSaudeRepository;
import com.api.dto.request.ProfissionalSaudeRequest;
import com.api.dto.response.ProfissionalSaudeResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProfissionalSaudeService {

    private final ProfissionalSaudeRepository profissionalRepository;

    public ProfissionalSaudeService(ProfissionalSaudeRepository profissionalRepository) {
        this.profissionalRepository = profissionalRepository;
    }

    public List<ProfissionalSaudeResponse> listarTodos(CategoriaProfissional categoria, String especialidade) {
        List<ProfissionalSaude> lista;
        if (categoria != null) {
            lista = profissionalRepository.findByCategoria(categoria);
        } else if (especialidade != null && !especialidade.trim().isEmpty()) {
            lista = profissionalRepository.findByEspecialidadeIgnoreCase(especialidade.trim());
        } else {
            lista = profissionalRepository.findAll();
        }
        return lista.stream().map(ProfissionalSaudeResponse::from).toList();
    }

    public ProfissionalSaudeResponse buscarPorId(Long id) {
        return ProfissionalSaudeResponse.from(buscarEntidadePorId(id));
    }

    public ProfissionalSaude buscarEntidadePorId(Long id) {
        return profissionalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profissional de saúde com ID " + id + " não encontrado."));
    }

    @Transactional
    public ProfissionalSaudeResponse cadastrar(ProfissionalSaudeRequest request) {
        if (profissionalRepository.existsByRegistroProfissional(request.registroProfissional())) {
            throw new BusinessRuleException("Já existe um profissional cadastrado com o registro: " + request.registroProfissional());
        }

        ProfissionalSaude profissional = new ProfissionalSaude(
                request.nome(),
                request.registroProfissional(),
                request.telefone(),
                request.email(),
                request.categoria(),
                request.especialidade(),
                request.atuacaoCirurgica()
        );

        ProfissionalSaude salvo = profissionalRepository.save(profissional);
        return ProfissionalSaudeResponse.from(salvo);
    }

    @Transactional
    public ProfissionalSaudeResponse atualizar(Long id, ProfissionalSaudeRequest request) {
        ProfissionalSaude profissional = buscarEntidadePorId(id);

        if (!profissional.getRegistroProfissional().equals(request.registroProfissional())
                && profissionalRepository.existsByRegistroProfissional(request.registroProfissional())) {
            throw new BusinessRuleException("Já existe outro profissional cadastrado com o registro: " + request.registroProfissional());
        }

        profissional.setNome(request.nome());
        profissional.setRegistroProfissional(request.registroProfissional());
        profissional.setTelefone(request.telefone());
        profissional.setEmail(request.email());
        profissional.setCategoria(request.categoria());
        profissional.setEspecialidade(request.especialidade());
        profissional.setAtuacaoCirurgica(request.atuacaoCirurgica());
        profissional.validarCategoria();

        return ProfissionalSaudeResponse.from(profissionalRepository.save(profissional));
    }

    @Transactional
    public void excluir(Long id) {
        ProfissionalSaude profissional = buscarEntidadePorId(id);
        profissionalRepository.delete(profissional);
    }
}
