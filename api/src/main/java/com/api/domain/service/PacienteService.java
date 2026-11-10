package com.api.domain.service;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.exception.ResourceNotFoundException;
import com.api.domain.model.Paciente;
import com.api.domain.repository.PacienteRepository;
import com.api.dto.request.PacienteRequest;
import com.api.dto.response.PacienteResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    public List<PacienteResponse> listarTodos() {
        return pacienteRepository.findAll().stream()
                .map(PacienteResponse::from)
                .toList();
    }

    public PacienteResponse buscarPorId(Long id) {
        return PacienteResponse.from(buscarEntidadePorId(id));
    }

    public Paciente buscarEntidadePorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente com ID " + id + " não encontrado."));
    }

    @Transactional
    public PacienteResponse cadastrar(PacienteRequest request) {
        if (pacienteRepository.existsByCpf(request.cpf())) {
            throw new BusinessRuleException("Já existe um paciente cadastrado com o CPF: " + request.cpf());
        }

        Paciente paciente = new Paciente(
                request.nome(),
                request.cpf(),
                request.dataNascimento(),
                request.telefone(),
                request.endereco(),
                request.email()
        );

        Paciente salvo = pacienteRepository.save(paciente);
        return PacienteResponse.from(salvo);
    }

    @Transactional
    public PacienteResponse atualizar(Long id, PacienteRequest request) {
        Paciente paciente = buscarEntidadePorId(id);

        if (!paciente.getCpf().equals(request.cpf()) && pacienteRepository.existsByCpf(request.cpf())) {
            throw new BusinessRuleException("Já existe outro paciente cadastrado com o CPF: " + request.cpf());
        }

        paciente.setNome(request.nome());
        paciente.setCpf(request.cpf());
        paciente.setDataNascimento(request.dataNascimento());
        paciente.setTelefone(request.telefone());
        paciente.setEndereco(request.endereco());
        paciente.setEmail(request.email());

        return PacienteResponse.from(pacienteRepository.save(paciente));
    }

    @Transactional
    public void excluir(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        pacienteRepository.delete(paciente);
    }
}

