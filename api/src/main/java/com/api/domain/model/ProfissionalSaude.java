package com.api.domain.model;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.model.enums.CategoriaProfissional;
import jakarta.persistence.*;

@Entity
@Table(name = "profissionais_saude")
public class ProfissionalSaude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "registro_profissional", nullable = false, unique = true, length = 30)
    private String registroProfissional;

    @Column(length = 20)
    private String telefone;

    @Column(length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoriaProfissional categoria;

    @Column(length = 100)
    private String especialidade;

    @Column(name = "atuacao_cirurgica", length = 200)
    private String atuacaoCirurgica;

    public ProfissionalSaude() {
    }

    public ProfissionalSaude(String nome, String registroProfissional, String telefone, String email,
                             CategoriaProfissional categoria, String especialidade, String atuacaoCirurgica) {
        this.nome = nome;
        this.registroProfissional = registroProfissional;
        this.telefone = telefone;
        this.email = email;
        this.categoria = categoria;
        this.especialidade = especialidade;
        this.atuacaoCirurgica = atuacaoCirurgica;
        validarCategoria();
    }

    public void validarCategoria() {
        if (categoria == CategoriaProfissional.ESPECIALISTA) {
            if (especialidade == null || especialidade.trim().isEmpty()) {
                throw new BusinessRuleException("Médico especialista deve possuir uma especialidade informada.");
            }
        }
        if (categoria == CategoriaProfissional.CIRURGIAO) {
            if (atuacaoCirurgica == null || atuacaoCirurgica.trim().isEmpty()) {
                throw new BusinessRuleException("Cirurgião deve possuir informações sobre sua atuação cirúrgica.");
            }
        }
    }

    public boolean isCompativelComEspecialidade(String especialidadeSolicitada) {
        if (this.categoria != CategoriaProfissional.ESPECIALISTA) {
            return false;
        }
        return this.especialidade != null && this.especialidade.equalsIgnoreCase(especialidadeSolicitada);
    }

    public boolean isCirurgiao() {
        return this.categoria == CategoriaProfissional.CIRURGIAO;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRegistroProfissional() {
        return registroProfissional;
    }

    public void setRegistroProfissional(String registroProfissional) {
        this.registroProfissional = registroProfissional;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public CategoriaProfissional getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaProfissional categoria) {
        this.categoria = categoria;
        validarCategoria();
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public String getAtuacaoCirurgica() {
        return atuacaoCirurgica;
    }

    public void setAtuacaoCirurgica(String atuacaoCirurgica) {
        this.atuacaoCirurgica = atuacaoCirurgica;
    }
}

