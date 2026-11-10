import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { formatCPF, formatTelefone, formatData } from "../../utils/formatters";

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");

  const [busca, setBusca] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    setUsuario(api.obterSessao());
    carregarPacientes();
  }, []);

  const isAdmin = usuario?.cargo === "Administrador";
  const isMedico = usuario?.cargo === "Médico Clínico";

  async function carregarPacientes() {
    setCarregando(true);
    setMensagemErro("");
    try {
      const dados = await api.getPacientes();
      setPacientes(dados || []);
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
      cpf,
      dataNascimento,
      telefone,
      email,
      endereco
    };

    try {
      const novo = await api.createPaciente(payload);
      setMensagemSucesso(`Paciente ${novo.nome} cadastrado com sucesso.`);
      setPacientes([novo, ...pacientes]);
      setNome("");
      setCpf("");
      setDataNascimento("");
      setTelefone("");
      setEmail("");
      setEndereco("");
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function handleExcluir(id, nomePaciente) {
    if (!isAdmin) {
      alert("Apenas administradores hospitalares têm permissão para remover cadastros de pacientes.");
      return;
    }
    if (!window.confirm(`Deseja remover o cadastro do paciente "${nomePaciente}"?`)) return;
    setMensagemSucesso("");
    setMensagemErro("");
    try {
      await api.deletePaciente(id);
      setMensagemSucesso(`Cadastro de ${nomePaciente} removido com sucesso.`);
      setPacientes(pacientes.filter((p) => p.id !== id));
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca) ||
      (p.email && p.email.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>{isMedico ? "Pacientes da Unidade" : "Prontuário & Cadastro de Pacientes"}</h1>
          <p>
            {isMedico
              ? "Localização de pacientes para atendimento clínico imediato, prescrição e internação"
              : "Identificação unificada de pacientes para atendimento clínico e internação hospitalar"}
          </p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      <div className="ds-card" style={{ marginBottom: "28px" }}>
        <div className="ds-card-header">
          <div className="ds-card-title">Cadastrar Novo Paciente</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ds-form-grid">
            <div className="ds-field">
              <label className="ds-label">Nome Completo *</label>
              <input
                className="ds-input"
                placeholder="Ex: Maria da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Documento de Identificação (CPF) *</label>
              <input
                className="ds-input"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Data de Nascimento *</label>
              <input
                className="ds-input"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Telefone de Contato *</label>
              <input
                className="ds-input"
                placeholder="(31) 98765-4321"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">E-mail</label>
              <input
                className="ds-input"
                type="email"
                placeholder="maria.silva@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Endereço Residencial</label>
              <input
                className="ds-input"
                placeholder="Rua, número, bairro e cidade"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="ds-btn ds-btn-primary">
              Cadastrar Paciente
            </button>
          </div>
        </form>
      </div>

      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div className="ds-card-title">
            <span>Pacientes Registrados</span>
            <span className="ds-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
              Total: {pacientesFiltrados.length}
            </span>
          </div>

          <div>
            <input
              className="ds-input"
              style={{ width: "240px", fontSize: "0.825rem", padding: "6px 10px" }}
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Carregando pacientes...
          </div>
        ) : (
          <div className="ds-table-container">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Nome do Paciente</th>
                  <th>Documento (CPF)</th>
                  <th>Nascimento</th>
                  <th>Contatos</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Nenhum paciente cadastrado.
                    </td>
                  </tr>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nome}</strong>
                      </td>
                      <td>
                        <code className="tabular-nums" style={{ color: "var(--text-muted)" }}>
                          {formatCPF(p.cpf)}
                        </code>
                      </td>
                      <td>
                        <span className="tabular-nums">{formatData(p.dataNascimento)}</span>
                      </td>
                      <td>
                        <div>{formatTelefone(p.telefone)}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.email}</div>
                      </td>
                      <td>{p.endereco || "Não informado"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {isMedico && (
                            <Link
                              to="/dashboard/consultas"
                              className="ds-btn ds-btn-sm ds-btn-primary"
                              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                              title="Agendar ou iniciar atendimento para este paciente"
                            >
                              + Atender
                            </Link>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              className="ds-btn ds-btn-sm ds-btn-secondary"
                              style={{ color: "var(--danger)" }}
                              onClick={() => handleExcluir(p.id, p.nome)}
                              title="Remover cadastro do paciente"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pacientes;
