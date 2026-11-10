import { useState, useEffect } from "react";
import { api } from "../../services/api";

function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário
  const [nome, setNome] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [categoria, setCategoria] = useState("CLINICO_GERAL");
  const [especialidade, setEspecialidade] = useState("");
  const [atuacaoCirurgica, setAtuacaoCirurgica] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("TODOS");
  const [busca, setBusca] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    carregarProfissionais();
  }, []);

  async function carregarProfissionais() {
    setCarregando(true);
    setMensagemErro("");
    try {
      const dados = await api.getProfissionais();
      setProfissionais(dados || []);
    } catch (err) {
      setMensagemErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    const payload = {
      nome,
      registroProfissional,
      categoria,
      especialidade: categoria === "ESPECIALISTA" ? especialidade : null,
      atuacaoCirurgica: categoria === "CIRURGIAO" ? atuacaoCirurgica : null,
      telefone,
      email
    };

    try {
      const novo = await api.createProfissional(payload);
      setMensagemSucesso(`Profissional ${novo.nome} (${novo.categoria}) cadastrado com sucesso no SQLite!`);
      setProfissionais([novo, ...profissionais]);
      setNome("");
      setRegistroProfissional("");
      setEspecialidade("");
      setAtuacaoCirurgica("");
      setTelefone("");
      setEmail("");
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function handleExcluir(id, nomeProfissional) {
    if (!window.confirm(`Tem certeza que deseja remover ${nomeProfissional} do corpo clínico?`)) return;
    setMensagemSucesso("");
    setMensagemErro("");
    try {
      await api.deleteProfissional(id);
      setMensagemSucesso(`Profissional ${nomeProfissional} removido.`);
      setProfissionais(profissionais.filter((p) => p.id !== id));
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  const profissionaisFiltrados = profissionais.filter((p) => {
    const matchCategoria = filtroCategoria === "TODOS" || p.categoria === filtroCategoria;
    const matchBusca =
      !busca ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.registroProfissional.toLowerCase().includes(busca.toLowerCase()) ||
      (p.especialidade && p.especialidade.toLowerCase().includes(busca.toLowerCase()));
    return matchCategoria && matchBusca;
  });

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>Corpo Clínico & Médicos</h1>
          <p>Cadastro e escala de médicos clínicos gerais, especialistas e cirurgiões habilitados</p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      <div className="ds-card" style={{ marginBottom: "28px" }}>
        <div className="ds-card-header">
          <div className="ds-card-title">Cadastrar Novo Profissional</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ds-form-grid">
            <div className="ds-field">
              <label className="ds-label">Nome Completo *</label>
              <input
                className="ds-input"
                placeholder="Ex: Dra. Camila Nogueira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Registro Profissional (CRM) *</label>
              <input
                className="ds-input"
                placeholder="Ex: CRM/MG 45890"
                value={registroProfissional}
                onChange={(e) => setRegistroProfissional(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Categoria de Atuação *</label>
              <select
                className="ds-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="CLINICO_GERAL">Médico Clínico Geral</option>
                <option value="ESPECIALISTA">Médico Especialista</option>
                <option value="CIRURGIAO">Cirurgião</option>
              </select>
            </div>

            {categoria === "ESPECIALISTA" && (
              <div className="ds-field">
                <label className="ds-label">Área de Especialidade *</label>
                <input
                  className="ds-input"
                  placeholder="Ex: Cardiologia, Ortopedia, Neurologia"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  required
                />
              </div>
            )}

            {categoria === "CIRURGIAO" && (
              <div className="ds-field">
                <label className="ds-label">Atuação Cirúrgica Registrada *</label>
                <input
                  className="ds-input"
                  placeholder="Ex: Cirurgia Geral e Laparoscopia"
                  value={atuacaoCirurgica}
                  onChange={(e) => setAtuacaoCirurgica(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="ds-field">
              <label className="ds-label">Telefone de Contato</label>
              <input
                className="ds-input"
                placeholder="(31) 3344-5566"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">E-mail Institucional</label>
              <input
                className="ds-input"
                type="email"
                placeholder="medico@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button type="submit" className="ds-btn ds-btn-primary">
              Salvar Profissional
            </button>
          </div>
        </form>
      </div>

      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">Profissionais Cadastrados ({profissionaisFiltrados.length})</div>
          <input
            className="ds-input"
            style={{ width: "220px", padding: "6px 12px", fontSize: "0.825rem" }}
            placeholder="Buscar por nome ou CRM..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="ds-tabs">
          <button
            className={`ds-tab ${filtroCategoria === "TODOS" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("TODOS")}
          >
            Todos ({profissionais.length})
          </button>
          <button
            className={`ds-tab ${filtroCategoria === "CLINICO_GERAL" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("CLINICO_GERAL")}
          >
            Clínicos Gerais
          </button>
          <button
            className={`ds-tab ${filtroCategoria === "ESPECIALISTA" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("ESPECIALISTA")}
          >
            Especialistas
          </button>
          <button
            className={`ds-tab ${filtroCategoria === "CIRURGIAO" ? "active" : ""}`}
            onClick={() => setFiltroCategoria("CIRURGIAO")}
          >
            Cirurgiões
          </button>
        </div>

        {carregando ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Buscando profissionais da saúde...
          </div>
        ) : (
          <div className="ds-table-container">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Nome do Médico</th>
                  <th>Registro (CRM)</th>
                  <th>Categoria</th>
                  <th>Especialidade / Foco Cirúrgico</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {profissionaisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Nenhum profissional encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  profissionaisFiltrados.map((p) => {
                    const badgeClass =
                      p.categoria === "CIRURGIAO"
                        ? "badge-cirurgiao"
                        : p.categoria === "ESPECIALISTA"
                        ? "badge-especialista"
                        : "badge-rotina";
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.nome}</strong>
                        </td>
                        <td>
                          <code className="tabular-nums" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            {p.registroProfissional}
                          </code>
                        </td>
                        <td>
                          <span className={`ds-badge ${badgeClass}`}>
                            {p.categoria === "CLINICO_GERAL"
                              ? "Clínico Geral"
                              : p.categoria === "ESPECIALISTA"
                              ? "Especialista"
                              : "Cirurgião"}
                          </span>
                        </td>
                        <td>
                          {p.especialidade && <strong>{p.especialidade}</strong>}
                          {p.atuacaoCirurgica && <span>{p.atuacaoCirurgica}</span>}
                          {!p.especialidade && !p.atuacaoCirurgica && (
                            <span style={{ color: "var(--text-muted)" }}>Consultas gerais e triagem</span>
                          )}
                        </td>
                        <td>
                          <div>{p.telefone || "Não informado"}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.email}</div>
                        </td>
                        <td>
                          <button
                            className="ds-btn ds-btn-sm ds-btn-secondary"
                            style={{ color: "var(--danger)" }}
                            onClick={() => handleExcluir(p.id, p.nome)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profissionais;
