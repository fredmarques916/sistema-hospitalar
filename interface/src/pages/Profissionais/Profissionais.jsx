import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { formatCategoriaProfissional, formatTelefone } from "../../utils/formatters";

function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Formulário (Administrativo)
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
    setUsuario(api.obterSessao());
    carregarProfissionais();
  }, []);

  const isAdmin = usuario?.cargo === "Administrador";
  const isMedico = usuario?.cargo === "Médico Clínico";

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
    if (!isAdmin) {
      alert("Apenas administradores podem cadastrar profissionais no corpo clínico.");
      return;
    }
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
      setMensagemSucesso(`Profissional ${novo.nome} (${formatCategoriaProfissional(novo.categoria)}) cadastrado com sucesso.`);
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
    if (!isAdmin) {
      alert("Apenas administradores podem descredenciar médicos.");
      return;
    }
    if (!window.confirm(`Deseja realmente remover ${nomeProfissional} do corpo clínico?`)) return;
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
          <h1>{isMedico ? "Especialistas & Interconsultas" : "Corpo Clínico & Médicos"}</h1>
          <p>
            {isMedico
              ? "Catálogo médico da unidade para encaminhamentos, pedidos de parecer e discussão clínica"
              : "Cadastro institucional, credenciamento e escala de médicos clínicos, especialistas e cirurgiões"}
          </p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      {/* Formulário para Administrador OU Banner Informativo para Médico */}
      {isMedico ? (
        <div className="ds-alert ds-alert-info" style={{ marginBottom: "28px" }}>
          <div>
            <strong>Diretório Médico da Unidade:</strong> Consulte os colegas por especialidade (Cardiologia, Cirurgia, Ortopedia) para encaminhamento de pacientes ou solicitação de interconsulta. A gestão cadastral de médicos é de competência administrativa.
          </div>
        </div>
      ) : (
        <div className="ds-card" style={{ marginBottom: "28px" }}>
          <div className="ds-card-header">
            <div className="ds-card-title">Cadastrar Novo Profissional (Corpo Clínico)</div>
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
                  <label className="ds-label">Atuação Cirúrgica *</label>
                  <input
                    className="ds-input"
                    placeholder="Ex: Cirurgia Geral e Videolaparoscopia"
                    value={atuacaoCirurgica}
                    onChange={(e) => setAtuacaoCirurgica(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="ds-field">
                <label className="ds-label">Telefone / Ramal de Contato</label>
                <input
                  className="ds-input"
                  placeholder="Ex: (31) 3344-5566"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>

              <div className="ds-field">
                <label className="ds-label">E-mail Institucional</label>
                <input
                  className="ds-input"
                  type="email"
                  placeholder="Ex: medico@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="ds-btn ds-btn-primary">
                Credenciar Profissional
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Médicos */}
      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div className="ds-card-title">
            <span>{isMedico ? "Quadro de Especialistas" : "Médicos Cadastrados"}</span>
            <span className="ds-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
              Total: {profissionaisFiltrados.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              className="ds-input"
              style={{ width: "220px", fontSize: "0.825rem", padding: "6px 10px" }}
              placeholder="Buscar por nome, CRM ou especialidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              className="ds-select"
              style={{ width: "auto", fontSize: "0.825rem", padding: "6px 10px" }}
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="TODOS">Todas Categorias</option>
              <option value="CLINICO_GERAL">Clínico Geral</option>
              <option value="ESPECIALISTA">Especialistas</option>
              <option value="CIRURGIAO">Cirurgiões</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
            Carregando corpo clínico...
          </div>
        ) : (
          <div className="ds-table-container">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Registro (CRM)</th>
                  <th>Categoria</th>
                  <th>Especialidade / Atuação</th>
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

                    const isVoce = usuario && p.email && p.email.toLowerCase() === usuario.email?.toLowerCase();

                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.nome}</strong> {isVoce && <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>(Você)</span>}
                        </td>
                        <td>
                          <code className="tabular-nums" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            {p.registroProfissional}
                          </code>
                        </td>
                        <td>
                          <span className={`ds-badge ${badgeClass}`}>
                            {formatCategoriaProfissional(p.categoria)}
                          </span>
                        </td>
                        <td>
                          {p.especialidade && <strong>{p.especialidade}</strong>}
                          {p.atuacaoCirurgica && <span>{p.atuacaoCirurgica}</span>}
                          {!p.especialidade && !p.atuacaoCirurgica && (
                            <span style={{ color: "var(--text-muted)" }}>Consultas gerais e pronto-atendimento</span>
                          )}
                        </td>
                        <td>
                          <div>{formatTelefone(p.telefone)}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.email}</div>
                        </td>
                        <td>
                          {isAdmin ? (
                            <button
                              type="button"
                              className="ds-btn ds-btn-sm ds-btn-secondary"
                              style={{ color: "var(--danger)" }}
                              onClick={() => handleExcluir(p.id, p.nome)}
                              title="Remover médico do corpo clínico"
                            >
                              Remover
                            </button>
                          ) : (
                            <Link
                              to="/dashboard/consultas"
                              className="ds-btn ds-btn-sm ds-btn-secondary"
                              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                              title="Encaminhar paciente para este médico"
                            >
                              Encaminhar
                            </Link>
                          )}
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
