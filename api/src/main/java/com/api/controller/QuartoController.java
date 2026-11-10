package com.api.controller;

import com.api.domain.model.enums.SituacaoQuarto;
import com.api.domain.model.enums.TipoQuarto;
import com.api.domain.service.QuartoService;
import com.api.dto.request.QuartoRequest;
import com.api.dto.response.QuartoResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quartos")
public class QuartoController {

    private final QuartoService quartoService;

    public QuartoController(QuartoService quartoService) {
        this.quartoService = quartoService;
    }

    @GetMapping
    public ResponseEntity<List<QuartoResponse>> listarTodos(
            @RequestParam(required = false) SituacaoQuarto situacao,
            @RequestParam(required = false) TipoQuarto tipoQuarto) {
        return ResponseEntity.ok(quartoService.listarTodos(situacao, tipoQuarto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(quartoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<QuartoResponse> cadastrar(@Valid @RequestBody QuartoRequest request) {
        QuartoResponse response = quartoService.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuartoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody QuartoRequest request) {
        return ResponseEntity.ok(quartoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/situacao")
    public ResponseEntity<Void> alterarSituacao(@PathVariable Long id, @RequestParam SituacaoQuarto novaSituacao) {
        quartoService.alterarSituacao(id, novaSituacao);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        quartoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
