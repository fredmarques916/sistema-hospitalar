/**
 * Serviço de Conexão com a API REST do Sistema Hospitalar
 * Todas as operações realizam requisições HTTP reais contra o backend Spring Boot
 * com persistência direta no banco de dados SQLite (hospital.db).
 */

const API_BASE_URL = "http://localhost:8080";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Formata a mensagem com base no padrão Problem Details (RFC 9457) retornado pelo backend
      let mensagem = data?.detail || data?.title || `Erro ${response.status}: Operação falhou`;

      if (data?.camposInvalidos) {
        const detalhes = Object.entries(data.camposInvalidos)
          .map(([campo, msg]) => `${campo}: ${msg}`)
          .join(" | ");
        mensagem += ` (${detalhes})`;
      }

      const error = new Error(mensagem);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.toLowerCase().includes("fetch")) {
      throw new Error(
        "Não foi possível conectar ao servidor backend (http://localhost:8080). Certifique-se de que a API Spring Boot com SQLite está em execução."
      );
    }
    throw err;
  }
}

export const api = {
  // Verificação de Conectividade
  checkHealth: async () => {
    try {
      await request("/pacientes");
      return true;
    } catch {
      return false;
    }
  },

  // ==========================================
  // PACIENTES (/pacientes)
  // ==========================================
  getPacientes: () => request("/pacientes"),
  getPacienteById: (id) => request(`/pacientes/${id}`),
  createPaciente: (pacienteData) =>
    request("/pacientes", {
      method: "POST",
      body: JSON.stringify(pacienteData),
    }),
  updatePaciente: (id, pacienteData) =>
    request(`/pacientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(pacienteData),
    }),
  deletePaciente: (id) =>
    request(`/pacientes/${id}`, {
      method: "DELETE",
    }),

  // ==========================================
  // PROFISSIONAIS DA SAÚDE (/profissionais)
  // ==========================================
  getProfissionais: (queryParams = "") =>
    request(`/profissionais${queryParams ? "?" + queryParams : ""}`),
  getProfissionalById: (id) => request(`/profissionais/${id}`),
  createProfissional: (profissionalData) =>
    request("/profissionais", {
      method: "POST",
      body: JSON.stringify(profissionalData),
    }),
  updateProfissional: (id, profissionalData) =>
    request(`/profissionais/${id}`, {
      method: "PUT",
      body: JSON.stringify(profissionalData),
    }),
  deleteProfissional: (id) =>
    request(`/profissionais/${id}`, {
      method: "DELETE",
    }),

  // ==========================================
  // QUARTOS E LEITOS (/quartos)
  // ==========================================
  getQuartos: (queryParams = "") =>
    request(`/quartos${queryParams ? "?" + queryParams : ""}`),
  getQuartoById: (id) => request(`/quartos/${id}`),
  createQuarto: (quartoData) =>
    request("/quartos", {
      method: "POST",
      body: JSON.stringify(quartoData),
    }),
  updateQuarto: (id, quartoData) =>
    request(`/quartos/${id}`, {
      method: "PUT",
      body: JSON.stringify(quartoData),
    }),
  patchQuartoSituacao: (id, novaSituacao) =>
    request(`/quartos/${id}/situacao?novaSituacao=${novaSituacao}`, {
      method: "PATCH",
    }),
  deleteQuarto: (id) =>
    request(`/quartos/${id}`, {
      method: "DELETE",
    }),

  // ==========================================
  // CONSULTAS E ATENDIMENTOS (/consultas)
  // ==========================================
  getConsultas: (queryParams = "") =>
    request(`/consultas${queryParams ? "?" + queryParams : ""}`),
  getConsultaById: (id) => request(`/consultas/${id}`),
  createConsulta: (consultaData) =>
    request("/consultas", {
      method: "POST",
      body: JSON.stringify(consultaData),
    }),
  patchConsultaSituacao: (id, novaSituacao, observacoes = "") =>
    request(`/consultas/${id}/situacao`, {
      method: "PATCH",
      body: JSON.stringify({ novaSituacao, observacoes }),
    }),
  deleteConsulta: (id) =>
    request(`/consultas/${id}`, {
      method: "DELETE",
    }),

  // ==========================================
  // INTERNAÇÕES (/internacoes)
  // ==========================================
  getInternacoes: (queryParams = "") =>
    request(`/internacoes${queryParams ? "?" + queryParams : ""}`),
  getInternacaoById: (id) => request(`/internacoes/${id}`),
  createInternacao: (internacaoData) =>
    request("/internacoes", {
      method: "POST",
      body: JSON.stringify(internacaoData),
    }),
  registrarAlta: (id, observacoesAlta = "") =>
    request(`/internacoes/${id}/alta`, {
      method: "PATCH",
      body: JSON.stringify({ observacoesAlta }),
    }),
};
