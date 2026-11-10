package com.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;

public record PacienteRequest(
    @NotBlank(message = "O nome do paciente é obrigatório")
    String nome,

    @NotBlank(message = "O CPF é obrigatório")
    String cpf,

    @NotNull(message = "A data de nascimento é obrigatória")
    @Past(message = "A data de nascimento deve ser no passado")
    LocalDate dataNascimento,

    String telefone,
    String endereco,
    String email
) {}

