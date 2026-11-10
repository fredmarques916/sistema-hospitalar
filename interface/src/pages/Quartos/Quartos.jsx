import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { formatTipoQuarto, formatSituacaoQuarto } from "../../utils/formatters";

function Quartos() {
  const [quartos, setQuartos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Formulário (Administrativo)
  const [numeroIdentificacao, setNumeroIdentificacao] = useState("");
  const [andar, setAndar] = useState("1");
  const [capacidadeMaxima, setCapacidadeMaxima] = useState("2");
  const [tipoQuarto, setTipoQuarto] = useState("ENFERMARIA");

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    setUsuario(api.obterSessao());
    carregarQuartos();
  }, []);

  const isAdmin = usuario?.cargo === "Administrador";
  const isMedico = usuario?.cargo === "Médico Clínico";

  async function carregarQuartos() {
    setCarregando(true);
    setMensagemErro("");
    try {
      const dados = await api.getQuartos();
      setQuartos(dados || []);
    } catch (err) {
      setMensagemErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isAdmin) {
      alert("Apenas administradores podem cadastrar novos quartos no sistema hospitalar.");
      return;
    }
    setMensagemSucesso("");
    setMensagemErro("");

    const payload = {
      numeroIdentificacao: Number(numeroIdentificacao),
      andar: Number(andar),
      capacidadeMaxima: Number(capacidadeMaxima),
      tipoQuarto
    };

    try {
      const novo = await api.createQuarto(payload);
      setMensagemSucesso(`Quarto #${novo.numeroIdentificacao} cadastrado com sucesso.`);
      setQuartos([...quartos, novo]);
      setNumeroIdentificacao("");
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function toggleManutencao(id, situacaoAtual) {
    if (!isAdmin) {
      alert("Apenas administradores podem alterar a disponibilidade técnica do quarto.");
      return;
    }
    setMensagemSucesso("");
    setMensagemErro("");
    const novaSituacao = situacaoAtual === "MANUTENCAO" ? "DISPONIVEL" : "MANUTENCAO";
    try {
      await api.patchQuartoSituacao(id, novaSituacao);
      setMensagemSucesso(`Situação do quarto atualizada para "${formatSituacaoQuarto(novaSituacao)}".`);
      carregarQuartos();
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function handleExcluir(id, numero) {
    if (!isAdmin) {
      alert("Apenas administradores podem remover quartos da infraestrutura.");
      return;
    }
    if (!window.confirm(`Deseja remover o quarto #${numero} do sistema?`)) return;
    setMensagemSucesso("");
    setMensagemErro("");
    try {
      await api.deleteQuarto(id);
      setMensagemSucesso(`Quarto #${numero} removido com sucesso.`);
      setQuartos(quartos.filter((q) => q.id !== id));
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  const quartosFiltrados = quartos.filter((q) => {
    return filtroTipo === "TODOS" || q.tipoQuarto === filtroTipo;
  });

  const totalLeitos = quartos.reduce((acc, q) => acc + q.capacidadeMaxima, 0);
  const ocupados = quartos.reduce((acc, q) => acc + q.quantidadeOcupantes, 0);
  const vagos = Math.max(0, totalLeitos - ocupados);

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>{isMedico ? "Vagas & Disponibilidade de Leitos" : "Gestão de Leitos & Quartos"}</h1>
          <p>
            {isMedico
              ? "Monitoramento em tempo real de vagas em enfermaria, isolamento e terapia intensiva (UTI)"
              : "Cadastro de infraestrutura predial, controle de capacidade e manutenção técnica de leitos"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isMedico && (
            <Link to="/dashboard/internacoes" className="ds-btn ds-btn-primary">
              + Prescrever Internação
            </Link>
          )}
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      {/* Informativo para Médicos ou Formulário para Administradores */}
      {isMedico ? (
        <div className="ds-alert ds-alert-info" style={{ marginBottom: "28px" }}>
          <div>
            <strong>Painel Clínico de Vagas:</strong> {vagos} leitos livres no momento ({quartos.filter(q => q.disponivel).length} quartos com vagas). Selecione um quarto disponível abaixo para alocar internação de seu paciente.
          </div>
        </div>
      ) : (
        <div className="ds-card" style={{ marginBottom: "28px" }}>
          <div className="ds-card-header">
            <div className="ds-card-title">Adicionar Novo Quarto / Leitos (Gestão Predial)</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ds-form-grid">
              <div className="ds-field">
                <label className="ds-label">Número do Quarto *</label>
                <input
                  className="ds-input"
                  type="number"
                  placeholder="Ex: 104"
                  value={numeroIdentificacao}
                  onChange={(e) => setNumeroIdentificacao(e.target.value)}
                  required
                />
              </div>

              <div className="ds-field">
                <label className="ds-label">Andar Hospitalar *</label>
                <input
                  className="ds-input"
                  type="number"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  required
                />
              </div>

              <div className="ds-field">
                <label className="ds-label">Tipo de Quarto *</label>
                <select
                  className="ds-select"
                  value={tipoQuarto}
                  onChange={(e) => {
                    const t = e.target.value;
                    setTipoQuarto(t);
                    if (t === "INDIVIDUAL" || t === "UTI") setCapacidadeMaxima("1");
                  }}
                >
                  <option value="INDIVIDUAL">Individual (Privativo)</option>
                  <option value="ENFERMARIA">Enfermaria Coletiva</option>
                  <option value="UTI">UTI (Terapia Intensiva)</option>
                </select>
              </div>

              <div className="ds-field">
                <label className="ds-label">Capacidade Máxima de Leitos *</label>
                <input
                  className="ds-input"
                  type="number"
                  min="1"
                  max={tipoQuarto === "INDIVIDUAL" ? "1" : "12"}
                  value={capacidadeMaxima}
                  onChange={(e) => setCapacidadeMaxima(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="ds-btn ds-btn-primary">
                Cadastrar Quarto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Quartos */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">
            <span>Mapa de Leitos Hospitalares</span>
            <span className="ds-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
              {vagos} leito(s) livre(s) de {totalLeitos}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="ds-select"
              style={{ width: "auto", fontSize: "0.825rem", padding: "6px 10px" }}
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="ENFERMARIA">Enfermaria</option>
              <option value="UTI">UTI</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
            Carregando leitos...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
              padding: "16px"
            }}
          >
            {quartosFiltrados.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                Nenhum quarto cadastrado nesta categoria.
              </div>
            ) : (
              quartosFiltrados.map((q) => {
                const ocupacaoPct = q.capacidadeMaxima > 0 ? (q.quantidadeOcupantes / q.capacidadeMaxima) * 100 : 0;
                let corBarra = "var(--success)";
                if (ocupacaoPct > 70) corBarra = "var(--danger)";
                else if (ocupacaoPct > 0) corBarra = "var(--warning)";

                const temVaga = q.disponivel && q.quantidadeOcupantes < q.capacidadeMaxima;

                return (
                  <div
                    key={q.id}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-lg)",
                      padding: "20px",
                      boxShadow: "var(--shadow-xs)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
                            Quarto {q.numeroIdentificacao}
                          </h3>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {q.andar}º Andar &bull; {formatTipoQuarto(q.tipoQuarto)}
                          </div>
                        </div>
                        <span
                          className="ds-badge"
                          style={{
                            background:
                              q.situacao === "DISPONIVEL"
                                ? "var(--success-subtle)"
                                : q.situacao === "OCUPADO"
                                ? "var(--danger-subtle)"
                                : "#f1f5f9",
                            color:
                              q.situacao === "DISPONIVEL"
                                ? "var(--success-text)"
                                : q.situacao === "OCUPADO"
                                ? "var(--danger-text)"
                                : "#64748b"
                          }}
                        >
                          {formatSituacaoQuarto(q.situacao)}
                        </span>
                      </div>

                      <div style={{ margin: "14px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-body)" }}>
                          <span>Ocupação de Leitos</span>
                          <strong className="tabular-nums">
                            {q.quantidadeOcupantes} / {q.capacidadeMaxima}
                          </strong>
                        </div>
                        <div
                          style={{
                            height: "7px",
                            background: "var(--bg-surface-elevated)",
                            borderRadius: "999px",
                            overflow: "hidden",
                            marginTop: "6px"
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(ocupacaoPct, 100)}%`,
                              backgroundColor: corBarra,
                              borderRadius: "999px",
                              transition: "width 0.3s ease"
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "12px",
                        borderTop: "1px solid var(--border-subtle)",
                        marginTop: "12px"
                      }}
                    >
                      {isAdmin ? (
                        <>
                          <button
                            type="button"
                            className="ds-btn ds-btn-sm ds-btn-secondary"
                            onClick={() => toggleManutencao(q.id, q.situacao)}
                          >
                            {q.situacao === "MANUTENCAO" ? "Liberar Quarto" : "Manutenção"}
                          </button>

                          {q.quantidadeOcupantes === 0 && (
                            <button
                              type="button"
                              className="ds-btn ds-btn-sm ds-btn-secondary"
                              style={{ color: "var(--danger)", border: "none" }}
                              onClick={() => handleExcluir(q.id, q.numeroIdentificacao)}
                              title="Remover quarto da infraestrutura"
                            >
                              Excluir
                            </button>
                          )}
                        </>
                      ) : (
                        temVaga ? (
                          <Link
                            to="/dashboard/internacoes"
                            className="ds-btn ds-btn-sm ds-btn-primary"
                            style={{ textDecoration: "none", width: "100%", textAlign: "center" }}
                          >
                            Internar Paciente Aqui
                          </Link>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", width: "100%", textAlign: "center" }}>
                            {q.situacao === "MANUTENCAO" ? "Em Manutenção Predial" : "Quarto Lotado"}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quartos;
