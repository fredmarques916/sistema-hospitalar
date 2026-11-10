package com.api.controller;

import com.api.domain.model.enums.ModalidadeAtendimento;
import com.api.domain.model.enums.SituacaoConsulta;
import com.api.domain.model.enums.StatusEmergencia;
import com.api.domain.service.ConsultaService;
import com.api.dto.request.AtualizarSituacaoConsultaRequest;
import com.api.dto.request.ConsultaRequest;
import com.api.dto.response.ConsultaResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping
    public ResponseEntity<List<ConsultaResponse>> listarTodas(
            @RequestParam(required = false) SituacaoConsulta situacao,
            @RequestParam(required = false) ModalidadeAtendimento modalidade,
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataConsulta,
            @RequestParam(required = false) StatusEmergencia statusEmergencia) {
        return ResponseEntity.ok(consultaService.listarTodas(situacao, modalidade, pacienteId, dataConsulta, statusEmergencia));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(consultaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ConsultaResponse> agendar(@Valid @RequestBody ConsultaRequest request) {
        ConsultaResponse response = consultaService.agendarConsulta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/situacao")
    public ResponseEntity<ConsultaResponse> atualizarSituacao(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarSituacaoConsultaRequest request) {
        return ResponseEntity.ok(consultaService.atualizarSituacao(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        consultaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
