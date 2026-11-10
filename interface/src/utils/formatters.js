/**
 * Funções utilitárias de formatação, máscaras e apresentação para o usuário.
 * Traduz enums técnicos para termos em português com ortografia correta (acentos, pontuação e caixa-baixa/alta).
 */

export function formatSituacaoConsulta(situacao) {
  if (!situacao) return "";
  const mapa = {
    AGENDADA: "Agendada",
    CONFIRMADA: "Confirmada",
    EM_ATENDIMENTO: "Em atendimento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
    NAO_COMPARECEU: "Não compareceu"
  };
  return mapa[situacao] || situacao;
}

export function formatModalidade(modalidade) {
  if (!modalidade) return "";
  const mapa = {
    ROTINA: "Consulta de Rotina",
    ESPECIALIZADA: "Consulta Especializada",
    EMERGENCIA: "Atendimento de Emergência",
    PROCEDIMENTO_CIRURGICO: "Procedimento Cirúrgico"
  };
  return mapa[modalidade] || modalidade;
}

export function formatPrioridadeEmergencia(prioridade) {
  if (!prioridade) return "";
  const mapa = {
    BAIXA: "Baixa",
    MODERADA: "Moderada",
    ALTA: "Alta",
    CRITICA: "Crítica"
  };
  return mapa[prioridade] || prioridade;
}

export function formatStatusEmergencia(status) {
  if (!status) return "";
  const mapa = {
    AGUARDANDO_AVALIACAO: "Aguardando avaliação",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDO: "Concluído"
  };
  return mapa[status] || status;
}

export function formatSituacaoProcedimento(situacao) {
  if (!situacao) return "";
  const mapa = {
    AGENDADO: "Agendado",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado"
  };
  return mapa[situacao] || situacao;
}

export function formatCategoriaProfissional(categoria) {
  if (!categoria) return "";
  const mapa = {
    CLINICO_GERAL: "Clínico Geral",
    ESPECIALISTA: "Especialista",
    CIRURGIAO: "Cirurgião"
  };
  return mapa[categoria] || categoria;
}

export function formatTipoQuarto(tipo) {
  if (!tipo) return "";
  const mapa = {
    INDIVIDUAL: "Individual",
    ENFERMARIA: "Enfermaria",
    UTI: "UTI"
  };
  return mapa[tipo] || tipo;
}

export function formatSituacaoQuarto(situacao) {
  if (!situacao) return "";
  const mapa = {
    DISPONIVEL: "Disponível",
    OCUPADO: "Ocupado",
    MANUTENCAO: "Em manutenção"
  };
  return mapa[situacao] || situacao;
}

export function formatCPF(cpf) {
  if (!cpf) return "";
  const limpo = cpf.toString().replace(/\D/g, "");
  if (limpo.length === 11) {
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
}

export function formatTelefone(telefone) {
  if (!telefone) return "Não informado";
  const limpo = telefone.toString().replace(/\D/g, "");
  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (limpo.length === 10) {
    return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}

export function formatData(dataStr) {
  if (!dataStr) return "";
  // Se estiver no formato YYYY-MM-DD
  if (typeof dataStr === "string" && /^\d{4}-\d{2}-\d{2}/.test(dataStr)) {
    const [ano, mes, dia] = dataStr.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }
  try {
    const d = new Date(dataStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("pt-BR");
    }
  } catch {
    // fallback
  }
  return dataStr;
}

export function formatHorario(horarioStr) {
  if (!horarioStr) return "";
  if (typeof horarioStr === "string" && horarioStr.length >= 5) {
    return horarioStr.slice(0, 5);
  }
  return horarioStr;
}

export function formatDataHora(dataHoraStr) {
  if (!dataHoraStr) return "";
  try {
    const d = new Date(dataHoraStr);
    if (!isNaN(d.getTime())) {
      const data = d.toLocaleDateString("pt-BR");
      const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return `${data} às ${hora}`;
    }
  } catch {
    // fallback
  }
  return dataHoraStr;
}
