const API_BASE_URL = "http://localhost:8080";

// Fallback de dados para garantir que a UI funcione fluidamente mesmo em testes isolados
const fallbackData = {
  pacientes: [
    { id: 1, nome: "Maria da Silva", cpf: "111.222.333-44", dataNascimento: "1985-04-12", telefone: "(31) 98765-4321", email: "maria.silva@email.com", endereco: "Rua das Flores, 120" },
    { id: 2, nome: "João Santos Pereira", cpf: "222.333.444-55", dataNascimento: "1990-08-25", telefone: "(31) 99123-8877", email: "joao.santos@email.com", endereco: "Av. Brasil, 450" },
    { id: 3, nome: "Ana Beatriz Oliveira", cpf: "333.444.555-66", dataNascimento: "1978-11-03", telefone: "(31) 97654-1122", email: "ana.oliveira@email.com", endereco: "Rua Bahia, 890" },
    { id: 4, nome: "Carlos Eduardo Souza", cpf: "444.555.666-77", dataNascimento: "2002-01-19", telefone: "(31) 98844-3322", email: "carlos.souza@email.com", endereco: "Rua Guajajaras, 301" }
  ],
  profissionais: [
    { id: 1, nome: "Dra. Camila Nogueira", registroProfissional: "CRM/MG 45890", categoria: "CLINICO_GERAL", especialidade: null, telefone: "(31) 3344-5566", email: "camila@hospital.com", atuacaoCirurgica: null },
    { id: 2, nome: "Dr. Roberto Drummond", registroProfissional: "CRM/MG 31204", categoria: "ESPECIALISTA", especialidade: "Cardiologia", telefone: "(31) 3344-5577", email: "roberto@hospital.com", atuacaoCirurgica: null },
    { id: 3, nome: "Dra. Letícia Rezende", registroProfissional: "CRM/MG 52189", categoria: "ESPECIALISTA", especialidade: "Ortopedia", telefone: "(31) 3344-5588", email: "leticia@hospital.com", atuacaoCirurgica: null },
    { id: 4, nome: "Dr. Fernando Albuquerque", registroProfissional: "CRM/MG 29811", categoria: "CIRURGIAO", especialidade: null, telefone: "(31) 3344-5599", email: "fernando@hospital.com", atuacaoCirurgica: "Cirurgia Geral e Laparoscópica" }
  ],
  quartos: [
    { id: 1, numeroIdentificacao: 101, andar: 1, capacidadeMaxima: 1, quantidadeOcupantes: 1, tipoQuarto: "INDIVIDUAL", situacao: "OCUPADO", disponivel: false },
    { id: 2, numeroIdentificacao: 102, andar: 1, capacidadeMaxima: 2, quantidadeOcupantes: 0, tipoQuarto: "ENFERMARIA", situacao: "DISPONIVEL", disponivel: true },
    { id: 3, numeroIdentificacao: 201, andar: 2, capacidadeMaxima: 4, quantidadeOcupantes: 2, tipoQuarto: "ENFERMARIA", situacao: "DISPONIVEL", disponivel: true },
    { id: 4, numeroIdentificacao: 301, andar: 3, capacidadeMaxima: 1, quantidadeOcupantes: 0, tipoQuarto: "UTI", situacao: "DISPONIVEL", disponivel: true }
  ],
  consultas: [
    {
      id: 1,
      paciente: { id: 2, nome: "João Santos Pereira" },
      profissional: { id: 1, nome: "Dra. Camila Nogueira", categoria: "CLINICO_GERAL" },
      dataConsulta: "2026-11-12",
      horario: "14:00",
      motivo: "Check-up preventivo anual",
      modalidade: "ROTINA",
      situacao: "AGENDADA",
      observacoes: "Paciente sem queixas agudas prévias."
    },
    {
      id: 2,
      paciente: { id: 3, nome: "Ana Beatriz Oliveira" },
      profissional: { id: 2, nome: "Dr. Roberto Drummond", categoria: "ESPECIALISTA", especialidade: "Cardiologia" },
      dataConsulta: "2026-11-13",
      horario: "10:30",
      motivo: "Avaliação de palpitações e teste ergométrico",
      modalidade: "ESPECIALIZADA",
      especialidadeRequerida: "Cardiologia",
      situacao: "CONFIRMADA",
      observacoes: "Encaminhado por clínico geral."
    },
    {
      id: 3,
      paciente: { id: 4, nome: "Carlos Eduardo Souza" },
      profissional: { id: 1, nome: "Dra. Camila Nogueira", categoria: "CLINICO_GERAL" },
      dataConsulta: "2026-11-10",
      horario: "08:15",
      motivo: "Dor torácica súbita e dispneia",
      modalidade: "EMERGENCIA",
      prioridadeEmergencia: "ALTA",
      statusEmergencia: "EM_ANDAMENTO",
      situacao: "EM_ATENDIMENTO",
      observacoes: "Em triagem com oxigenoterapia."
    },
    {
      id: 4,
      paciente: { id: 1, nome: "Maria da Silva" },
      profissional: { id: 4, nome: "Dr. Fernando Albuquerque", categoria: "CIRURGIAO" },
      dataConsulta: "2026-11-15",
      horario: "08:00",
      motivo: "Apendicectomia laparoscópica programada",
      modalidade: "PROCEDIMENTO_CIRURGICO",
      tipoCirurgia: "Apendicectomia",
      descricaoProcedimento: "Remoção de apêndice por videolaparoscopia",
      dataHoraPrevista: "2026-11-15T08:00:00",
      situacaoProcedimento: "AGENDADO",
      situacao: "AGENDADA",
      observacoesPreOperatorias: "Jejum de 8h."
    }
  ],
  internacoes: [
    {
      id: 1,
      paciente: { id: 1, nome: "Maria da Silva", cpf: "111.222.333-44" },
      profissionalResponsavel: { id: 1, nome: "Dra. Camila Nogueira" },
      quarto: { id: 1, numeroIdentificacao: 101, andar: 1, tipoQuarto: "INDIVIDUAL" },
      dataEntrada: "2026-11-08T10:00:00",
      dataPrevistaAlta: "2026-11-12T16:00:00",
      dataEfetivaAlta: null,
      observacoes: "Paciente em observação pós-crise hipertensiva.",
      ativa: true
    }
  ]
};

async function fetchWithFallback(endpoint, options = {}, fallbackKey = null) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.title || `Erro ${res.status}: Requisição falhou`);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[API] Falha ao conectar em ${endpoint}: ${err.message}. Usando dados locais de apoio.`);
    if (fallbackKey && fallbackData[fallbackKey]) {
      return fallbackData[fallbackKey];
    }
    throw err;
  }
}

export const api = {
  // Pacientes
  getPacientes: () => fetchWithFallback("/pacientes", {}, "pacientes"),
  createPaciente: (data) => fetchWithFallback("/pacientes", { method: "POST", body: JSON.stringify(data) }),

  // Profissionais
  getProfissionais: (params = "") => fetchWithFallback(`/profissionais${params ? "?" + params : ""}`, {}, "profissionais"),
  createProfissional: (data) => fetchWithFallback("/profissionais", { method: "POST", body: JSON.stringify(data) }),

  // Quartos
  getQuartos: () => fetchWithFallback("/quartos", {}, "quartos"),
  createQuarto: (data) => fetchWithFallback("/quartos", { method: "POST", body: JSON.stringify(data) }),
  patchQuartoSituacao: (id, novaSituacao) =>
    fetchWithFallback(`/quartos/${id}/situacao?novaSituacao=${novaSituacao}`, { method: "PATCH" }),

  // Consultas
  getConsultas: (params = "") => fetchWithFallback(`/consultas${params ? "?" + params : ""}`, {}, "consultas"),
  createConsulta: (data) => fetchWithFallback("/consultas", { method: "POST", body: JSON.stringify(data) }),
  patchConsultaSituacao: (id, novaSituacao, observacoes = "") =>
    fetchWithFallback(`/consultas/${id}/situacao`, {
      method: "PATCH",
      body: JSON.stringify({ novaSituacao, observacoes })
    }),

  // Internações
  getInternacoes: (params = "") => fetchWithFallback(`/internacoes${params ? "?" + params : ""}`, {}, "internacoes"),
  createInternacao: (data) => fetchWithFallback("/internacoes", { method: "POST", body: JSON.stringify(data) }),
  registrarAlta: (id, observacoesAlta = "") =>
    fetchWithFallback(`/internacoes/${id}/alta`, {
      method: "PATCH",
      body: JSON.stringify({ observacoesAlta })
    })
};
