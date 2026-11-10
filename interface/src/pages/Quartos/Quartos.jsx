import { useState, useEffect } from "react";
import { api } from "../../services/api";

function Quartos() {
  const [quartos, setQuartos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário
  const [numeroIdentificacao, setNumeroIdentificacao] = useState("");
  const [andar, setAndar] = useState("1");
  const [capacidadeMaxima, setCapacidadeMaxima] = useState("2");
  const [tipoQuarto, setTipoQuarto] = useState("ENFERMARIA");

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    carregarQuartos();
  }, []);

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
      setMensagemSucesso(`Quarto #${novo.numeroIdentificacao} cadastrado com sucesso no SQLite!`);
      setQuartos([...quartos, novo]);
      setNumeroIdentificacao("");
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function toggleManutencao(id, situacaoAtual) {
    setMensagemSucesso("");
    setMensagemErro("");
    const novaSituacao = situacaoAtual === "MANUTENCAO" ? "DISPONIVEL" : "MANUTENCAO";
    try {
      await api.patchQuartoSituacao(id, novaSituacao);
      setMensagemSucesso(`Situação do quarto atualizada para ${novaSituacao}.`);
      carregarQuartos();
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function handleExcluir(id, numero) {
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

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>Gestão de Leitos & Quartos</h1>
          <p>Monitoramento de ocupação em tempo real, enfermarias, leitos de UTI e isolamento</p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      <div className="ds-card" style={{ marginBottom: "28px" }}>
        <div className="ds-card-header">
          <div className="ds-card-title">Adicionar Novo Quarto / Leitos</div>
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

          <div style={{ marginTop: "20px" }}>
            <button type="submit" className="ds-btn ds-btn-primary">
              Cadastrar Quarto
            </button>
          </div>
        </form>
      </div>

      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">Quartos Cadastrados ({quartosFiltrados.length})</div>
        </div>

        <div className="ds-tabs">
          <button
            className={`ds-tab ${filtroTipo === "TODOS" ? "active" : ""}`}
            onClick={() => setFiltroTipo("TODOS")}
          >
            Todos ({quartos.length})
          </button>
          <button
            className={`ds-tab ${filtroTipo === "INDIVIDUAL" ? "active" : ""}`}
            onClick={() => setFiltroTipo("INDIVIDUAL")}
          >
            Individuais
          </button>
          <button
            className={`ds-tab ${filtroTipo === "ENFERMARIA" ? "active" : ""}`}
            onClick={() => setFiltroTipo("ENFERMARIA")}
          >
            Enfermarias
          </button>
          <button
            className={`ds-tab ${filtroTipo === "UTI" ? "active" : ""}`}
            onClick={() => setFiltroTipo("UTI")}
          >
            UTIs
          </button>
        </div>

        {carregando ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Buscando leitos no SQLite...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px"
            }}
          >
            {quartosFiltrados.map((q) => {
              const ocupacaoPct = (q.quantidadeOcupantes / q.capacidadeMaxima) * 100;
              const corBarra =
                q.situacao === "MANUTENCAO"
                  ? "#94a3b8"
                  : ocupacaoPct >= 100
                  ? "var(--danger)"
                  : ocupacaoPct > 0
                  ? "var(--warning)"
                  : "var(--success)";

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
                          {q.andar}º Andar &bull; {q.tipoQuarto}
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
                        {q.situacao}
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
                    <button
                      className="ds-btn ds-btn-sm ds-btn-secondary"
                      onClick={() => toggleManutencao(q.id, q.situacao)}
                    >
                      {q.situacao === "MANUTENCAO" ? "Liberar Quarto" : "Manutenção"}
                    </button>

                    {q.quantidadeOcupantes === 0 && (
                      <button
                        className="ds-btn ds-btn-sm ds-btn-secondary"
                        style={{ color: "var(--danger)", border: "none" }}
                        onClick={() => handleExcluir(q.id, q.numeroIdentificacao)}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quartos;
