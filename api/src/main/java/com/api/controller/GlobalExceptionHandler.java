package com.api.controller;

import com.api.domain.exception.BusinessRuleException;
import com.api.domain.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessRuleException.class)
    public ProblemDetail handleBusinessRuleException(BusinessRuleException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problemDetail.setTitle("Regra de Negócio Violada");
        problemDetail.setType(URI.create("https://hospital.local/erros/regra-de-negocio"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Recurso Não Encontrado");
        problemDetail.setType(URI.create("https://hospital.local/erros/nao-encontrado"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNoResourceFoundException(NoResourceFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Recurso não encontrado: " + ex.getResourcePath());
        problemDetail.setTitle("Endpoint Não Encontrado");
        problemDetail.setType(URI.create("https://hospital.local/erros/endpoint-nao-encontrado"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Falha de validação dos dados de entrada.");
        problemDetail.setTitle("Erro de Validação");
        problemDetail.setType(URI.create("https://hospital.local/erros/validacao"));

        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            erros.put(error.getField(), error.getDefaultMessage())
        );
        problemDetail.setProperty("camposInvalidos", erros);
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        log.error("Erro interno não tratado: ", ex);
        String mensagem = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Ocorreu um erro interno inesperado.";
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, mensagem);
        problemDetail.setTitle("Erro Interno do Servidor");
        problemDetail.setProperty("detalhe", ex.getMessage());
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }
}
