import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import { api } from "../../services/api";
import {
  formatCategoriaProfissional,
  formatModalidade,
  formatPrioridadeEmergencia,
  formatSituacaoConsulta,
  formatData,
  formatHorario
} from "../../utils/formatters";
import "./Dashboard.css";

function Dashboard() {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [internacoes, setInternacoes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [erroConexao, setErroConexao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErroConexao(null);
    try {
      const [p, c, i, q] = await Promise.all([
        api.getPacientes(),
        api.getConsultas(),
        api.getInternacoes(),
        api.getQuartos()
      ]);
      setPacientes(p || []);
      setConsultas(c || []);
      setInternacoes(i || []);
      setQuartos(q || []);
    } catch (err) {
      setErroConexao(err.message);
    } finally {
      setCarregando(false);
    }
  }

  const internacoesAtivas = internacoes.filter((i) => i.ativa);
  const quartosDisponiveis = quartos.filter((q) => q.disponivel);
  const totalLeitos = quartos.reduce((acc, q) => acc + q.capacidadeMaxima, 0);
  const leitosOcupados = quartos.reduce((acc, q) => acc + q.quantidadeOcupantes, 0);

  const emergenciasAtivas = consultas.filter(
    (c) => c.modalidade === "EMERGENCIA" && c.situacao !== "CONCLUIDA" && c.situacao !== "CANCELADA"
  );

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>Painel de Controle Hospitalar</h1>
          <p>Visão geral dos atendimentos, leitos e pacientes em tempo real</p>
        </div>
        <div>
          <Link to="/dashboard/consultas" className="ds-btn ds-btn-primary">
            + Agendar Atendimento
          </Link>
        </div>
      </div>

      {erroConexao && (
        <div className="ds-alert ds-alert-danger">
          <strong>Aviso de Comunicação:</strong> Não foi possível sincronizar os dados da unidade. Verifique se a aplicação está ativa.
        </div>
      )}

      {emergenciasAtivas.length > 0 && (
        <div className="ds-alert ds-alert-danger" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>🚨</span>
            <div>
              <strong>{emergenciasAtivas.length} Atendimento(s) de Emergência Pendente(s)</strong>
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                Triagem prioritária ativa na fila de pronto-socorro.
              </div>
            </div>
          </div>
          <Link to="/dashboard/consultas" className="ds-btn ds-btn-sm ds-btn-danger" style={{ background: "#991b1b", color: "#fff" }}>
            Atender Agora
          </Link>
        </div>
      )}

      <div className="ds-stats-grid">
        <Card
          titulo="Pacientes"
          valor={pacientes.length.toString()}
          descricao="Pacientes cadastrados na unidade"
          variante="primary"
        />

        <Card
          titulo="Atendimentos"
          valor={consultas.length.toString()}
          descricao="Consultas & procedimentos"
        />

        <Card
          titulo="Pacientes Internados"
          valor={internacoesAtivas.length.toString()}
          descricao={`${leitosOcupados} de ${totalLeitos} leitos ocupados`}
          variante={leitosOcupados > 0 ? "warning" : "success"}
        />

        <Card
          titulo="Quartos com Vagas"
          valor={quartosDisponiveis.length.toString()}
          descricao={`Total de ${quartos.length} quartos cadastrados`}
          variante="success"
        />
      </div>

      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">
            <span>Últimos Atendimentos & Consultas</span>
            <span className="ds-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
              Total: {consultas.length}
            </span>
          </div>
          <Link to="/dashboard/consultas" className="ds-btn ds-btn-secondary ds-btn-sm">
            Ver Todos
          </Link>
        </div>

        {carregando ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
            Carregando atendimentos...
          </div>
        ) : (
          <div className="ds-table-container">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Profissional / Categoria</th>
                  <th>Modalidade</th>
                  <th>Data & Horário</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {consultas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      Nenhum atendimento registrado no momento.
                    </td>
                  </tr>
                ) : (
                  consultas.slice(0, 6).map((c) => {
                    const badgeClass = `badge-${c.situacao?.toLowerCase().replace("_", "-")}`;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.paciente?.nome}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.motivo}</div>
                        </td>
                        <td>
                          <div>{c.profissional?.nome}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {formatCategoriaProfissional(c.profissional?.categoria)} {c.especialidadeRequerida ? `(${c.especialidadeRequerida})` : ""}
                          </div>
                        </td>
                        <td>
                          <span className="ds-badge" style={{ background: "#f1f5f9", color: "#334155" }}>
                            {formatModalidade(c.modalidade)}
                          </span>
                          {c.prioridadeEmergencia && (
                            <span className="ds-badge" style={{ marginLeft: "6px", background: "#fee2e2", color: "#dc2626" }}>
                              {formatPrioridadeEmergencia(c.prioridadeEmergencia)}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="tabular-nums">{formatData(c.dataConsulta)}</span> às <span className="tabular-nums">{formatHorario(c.horario)}</span>
                        </td>
                        <td>
                          <span className={`ds-badge ${badgeClass}`}>
                            {formatSituacaoConsulta(c.situacao)}
                          </span>
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

export default Dashboard;
