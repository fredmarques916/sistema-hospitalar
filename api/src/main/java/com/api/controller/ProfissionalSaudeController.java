package com.api.controller;

import com.api.domain.model.enums.CategoriaProfissional;
import com.api.domain.service.ProfissionalSaudeService;
import com.api.dto.request.ProfissionalSaudeRequest;
import com.api.dto.response.ProfissionalSaudeResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profissionais")
public class ProfissionalSaudeController {

    private final ProfissionalSaudeService profissionalService;

    public ProfissionalSaudeController(ProfissionalSaudeService profissionalService) {
        this.profissionalService = profissionalService;
    }

    @GetMapping
    public ResponseEntity<List<ProfissionalSaudeResponse>> listarTodos(
            @RequestParam(required = false) CategoriaProfissional categoria,
            @RequestParam(required = false) String especialidade) {
        return ResponseEntity.ok(profissionalService.listarTodos(categoria, especialidade));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfissionalSaudeResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(profissionalService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProfissionalSaudeResponse> cadastrar(@Valid @RequestBody ProfissionalSaudeRequest request) {
        ProfissionalSaudeResponse response = profissionalService.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfissionalSaudeResponse> atualizar(@PathVariable Long id,
                                                              @Valid @RequestBody ProfissionalSaudeRequest request) {
        return ResponseEntity.ok(profissionalService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        profissionalService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
