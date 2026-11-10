import { useState, useEffect } from "react";
import { api } from "../../services/api";

function Historico() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState("");
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [consultasPaciente, setConsultasPaciente] = useState([]);
  const [internacoesPaciente, setInternacoesPaciente] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function carregarLista() {
      setCarregando(true);
      setMensagemErro("");
      try {
        const dados = await api.getPacientes();
        setPacientes(dados || []);
        if (dados && dados.length > 0) {
          setPacienteSelecionadoId(dados[0].id.toString());
          selecionarPaciente(dados[0].id, dados);
        }
      } catch (err) {
        setMensagemErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarLista();
  }, []);

  async function selecionarPaciente(id, lista = pacientes) {
    const p = lista.find((item) => item.id.toString() === id.toString());
    setPacienteAtual(p || null);

    try {
      const [consultas, internacoes] = await Promise.all([
        api.getConsultas(`pacienteId=${id}`),
        api.getInternacoes(`pacienteId=${id}`)
      ]);
      setConsultasPaciente(consultas || []);
      setInternacoesPaciente(internacoes || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>Prontuário & Histórico Clínico</h1>
          <p>Linha do tempo consolidada de consultas, especialidades e internações do paciente</p>
        </div>
      </div>

      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      <div className="ds-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
          <div className="ds-field" style={{ minWidth: "320px", flex: 1 }}>
            <label className="ds-label">Selecione o Paciente</label>
            <select
              className="ds-select"
              value={pacienteSelecionadoId}
              onChange={(e) => {
                setPacienteSelecionadoId(e.target.value);
                selecionarPaciente(e.target.value);
              }}
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} (CPF: {p.cpf})
                </option>
              ))}
            </select>
          </div>

          <button
            className="ds-btn ds-btn-primary"
            onClick={() => selecionarPaciente(pacienteSelecionadoId)}
          >
            Atualizar Prontuário
          </button>
        </div>
      </div>

      {pacienteAtual && (
        <div className="ds-card">
          <div className="ds-card-header">
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                {pacienteAtual.nome}
              </h2>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                CPF: <strong className="tabular-nums">{pacienteAtual.cpf}</strong> &bull; Nasc:{" "}
                <span className="tabular-nums">{pacienteAtual.dataNascimento}</span> &bull; Telefone:{" "}
                {pacienteAtual.telefone || "N/A"}
              </div>
            </div>
            <span className="ds-badge" style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}>
              Prontuário Ativo #{pacienteAtual.id}
            </span>
          </div>

          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: "16px 0 20px" }}>
            Linha do Tempo de Atendimentos & Internações
          </h3>

          {consultasPaciente.length === 0 && internacoesPaciente.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Nenhum registro de consulta ou internação cadastrado para este paciente no SQLite.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {consultasPaciente.map((c) => {
                const situacaoBadge = `badge-${c.situacao?.toLowerCase().replace("_", "-")}`;
                return (
                  <div
                    key={`c-${c.id}`}
                    style={{
                      borderLeft: "4px solid var(--primary)",
                      padding: "16px 20px",
                      background: "var(--bg-app)",
                      borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                      borderTop: "1px solid var(--border-subtle)",
                      borderRight: "1px solid var(--border-subtle)",
                      borderBottom: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>
                        ATENDIMENTO: {c.modalidade}
                      </span>
                      <span className={`ds-badge ${situacaoBadge}`}>
                        {c.situacao}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                      {c.motivo}
                    </h4>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      📅 {c.dataConsulta} às {c.horario} &bull; Médico: <strong>{c.profissional?.nome}</strong> ({c.profissional?.categoria})
                    </div>

                    {c.especialidadeRequerida && (
                      <div style={{ fontSize: "0.825rem", color: "var(--specialist-text)", marginTop: "4px" }}>
                        🔬 Especialidade Requerida: <strong>{c.especialidadeRequerida}</strong>
                      </div>
                    )}

                    {c.tipoCirurgia && (
                      <div style={{ fontSize: "0.825rem", color: "var(--surgery-text)", marginTop: "4px" }}>
                        ⚕️ Procedimento Cirúrgico: <strong>{c.tipoCirurgia}</strong> &bull; {c.descricaoProcedimento}
                      </div>
                    )}

                    {c.observacoes && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-body)", fontStyle: "italic", marginTop: "8px", background: "#ffffff", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                        &ldquo;{c.observacoes}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })}

              {internacoesPaciente.map((i) => (
                <div
                  key={`i-${i.id}`}
                  style={{
                    borderLeft: "4px solid var(--surgery)",
                    padding: "16px 20px",
                    background: "var(--bg-app)",
                    borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                    borderTop: "1px solid var(--border-subtle)",
                    borderRight: "1px solid var(--border-subtle)",
                    borderBottom: "1px solid var(--border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--surgery)" }}>
                      INTERNAÇÃO HOSPITALAR
                    </span>
                    <span
                      className="ds-badge"
                      style={{
                        background: i.ativa ? "var(--success-subtle)" : "#f1f5f9",
                        color: i.ativa ? "var(--success-text)" : "#64748b"
                      }}
                    >
                      {i.ativa ? "Internação Ativa" : "Alta Realizada"}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                    Quarto {i.quarto?.numeroIdentificacao} ({i.quarto?.tipoQuarto} &bull; Andar {i.quarto?.andar})
                  </h4>

                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Entrada: {new Date(i.dataEntrada).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} &bull; Médico Responsável: <strong>{i.profissionalResponsavel?.nome}</strong>
                  </div>

                  {i.dataEfetivaAlta ? (
                    <div style={{ fontSize: "0.825rem", color: "var(--success-text)", marginTop: "4px" }}>
                      ✅ Alta registrada em: {new Date(i.dataEfetivaAlta).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Previsão de alta: {i.dataPrevistaAlta ? new Date(i.dataPrevistaAlta).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Acompanhamento em curso"}
                    </div>
                  )}

                  {i.observacoes && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-body)", fontStyle: "italic", marginTop: "8px", background: "#ffffff", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      &ldquo;{i.observacoes}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Historico;
