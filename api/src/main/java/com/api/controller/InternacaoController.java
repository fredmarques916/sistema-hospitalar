package com.api.controller;

import com.api.domain.service.InternacaoService;
import com.api.dto.request.InternacaoRequest;
import com.api.dto.request.RegistrarAltaRequest;
import com.api.dto.response.InternacaoResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internacoes")
public class InternacaoController {

    private final InternacaoService internacaoService;

    public InternacaoController(InternacaoService internacaoService) {
        this.internacaoService = internacaoService;
    }

    @GetMapping
    public ResponseEntity<List<InternacaoResponse>> listarTodas(
            @RequestParam(required = false) Boolean apenasAtivas,
            @RequestParam(required = false) Long pacienteId) {
        return ResponseEntity.ok(internacaoService.listarTodas(apenasAtivas, pacienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternacaoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(internacaoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InternacaoResponse> criarInternacao(@Valid @RequestBody InternacaoRequest request) {
        InternacaoResponse response = internacaoService.criarInternacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/alta")
    public ResponseEntity<InternacaoResponse> registrarAlta(@PathVariable Long id,
                                                            @RequestBody(required = false) RegistrarAltaRequest request) {
        return ResponseEntity.ok(internacaoService.registrarAlta(id, request));
    }
}

