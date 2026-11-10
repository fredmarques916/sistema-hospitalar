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
  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("MINHAS");

  useEffect(() => {
    setUsuario(api.obterSessao());
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

  const isAdmin = usuario?.cargo === "Administrador";
  const isMedico = usuario?.cargo === "Médico Clínico";

  const isDoctorAttending = (profissional) => {
    if (!profissional || !usuario) return false;
    if (profissional.email && usuario.email && profissional.email.toLowerCase() === usuario.email.toLowerCase()) {
      return true;
    }
    if (profissional.nome && usuario.nome) {
      const pClean = profissional.nome.toLowerCase().replace(/dr(a)?\.\s*/i, "").trim();
      const uClean = usuario.nome.toLowerCase().replace(/dr(a)?\.\s*/i, "").trim();
      if (pClean && uClean && (pClean.includes(uClean) || uClean.includes(pClean))) {
        return true;
      }
    }
    return false;
  };

  const internacoesAtivas = internacoes.filter((i) => i.ativa);
  const quartosDisponiveis = quartos.filter((q) => q.disponivel);
  const totalLeitos = quartos.reduce((acc, q) => acc + q.capacidadeMaxima, 0);
  const leitosOcupados = quartos.reduce((acc, q) => acc + q.quantidadeOcupantes, 0);
  const leitosDisponiveis = Math.max(0, totalLeitos - leitosOcupados);
  const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;

  const emergenciasAtivas = consultas.filter(
    (c) => c.modalidade === "EMERGENCIA" && c.situacao !== "CONCLUIDA" && c.situacao !== "CANCELADA"
  );

  const minhasConsultas = consultas.filter((c) => isDoctorAttending(c.profissional));
  const minhasInternacoes = internacoesAtivas.filter((i) => isDoctorAttending(i.profissionalResponsavel));

  async function handleAcaoRapida(id, novaSituacao) {
    try {
      await api.patchConsultaSituacao(id, novaSituacao);
      carregarDados();
    } catch (err) {
      alert("Não foi possível atualizar o atendimento: " + err.message);
    }
  }

  const consultasExibidas = isMedico
    ? (abaAtiva === "MINHAS" ? minhasConsultas : consultas)
    : consultas;

  return (
    <div>
      {/* Header Contextual por Perfil */}
      <div className="ds-page-header">
        <div className="ds-page-title">
          {isMedico ? (
            <>
              <h1>Painel Clínico — {usuario?.nome || "Dr. Carlos Eduardo"}</h1>
              <p>Atendimentos sob sua responsabilidade clínica, urgências no pronto-socorro e vagas de leitos</p>
            </>
          ) : (
            <>
              <h1>Painel de Controle Hospitalar</h1>
              <p>Visão executiva de atendimentos, capacidade de leitos e pacientes em tempo real</p>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {isMedico ? (
            <>
              <Link to="/dashboard/consultas" className="ds-btn ds-btn-primary">
                + Iniciar Atendimento
              </Link>
              <Link to="/dashboard/internacoes" className="ds-btn ds-btn-secondary">
                + Prescrever Internação
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/profissionais" className="ds-btn ds-btn-secondary">
                + Cadastrar Médico
              </Link>
              <Link to="/dashboard/quartos" className="ds-btn ds-btn-secondary">
                + Adicionar Quarto
              </Link>
              <Link to="/dashboard/consultas" className="ds-btn ds-btn-primary">
                + Agendar Atendimento
              </Link>
            </>
          )}
        </div>
      </div>

      {erroConexao && (
        <div className="ds-alert ds-alert-danger">
          <strong>Aviso de Comunicação:</strong> Não foi possível sincronizar os dados da unidade. Verifique se o servidor backend está em execução.
        </div>
      )}

      {/* Alerta de Emergência */}
      {emergenciasAtivas.length > 0 && (
        <div className="ds-alert ds-alert-danger" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.3rem" }}>🚨</span>
            <div>
              <strong>{emergenciasAtivas.length} Atendimento(s) de Emergência Pendente(s)</strong>
              <div style={{ fontSize: "0.825rem", opacity: 0.95 }}>
                {isMedico
                  ? "Pacientes em triagem prioritária aguardando acolhimento ou conduta médica imediata."
                  : "Fila de urgência prioritária ativa no pronto-socorro."}
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/consultas"
            className="ds-btn ds-btn-sm"
            style={{ background: "#991b1b", color: "#fff", textDecoration: "none" }}
          >
            {isMedico ? "Atender no Pronto-Socorro" : "Ver Fila de Urgência"}
          </Link>
        </div>
      )}

      {/* Métricas Contextuais por Perfil */}
      <div className="ds-stats-grid">
        {isMedico ? (
          <>
            <Card
              titulo="Meus Atendimentos"
              valor={minhasConsultas.length.toString()}
              descricao="Consultas atribuídas a você"
              variante="primary"
            />
            <Card
              titulo="Urgências na Fila"
              valor={emergenciasAtivas.length.toString()}
              descricao="Pronto-socorro aguardando conduta"
              variante={emergenciasAtivas.length > 0 ? "warning" : "default"}
            />
            <Card
              titulo="Minhas Internações"
              valor={minhasInternacoes.length.toString()}
              descricao="Pacientes internados sob seu cuidado"
              variante={minhasInternacoes.length > 0 ? "warning" : "success"}
            />
            <Card
              titulo="Leitos Vagos"
              valor={leitosDisponiveis.toString()}
              descricao={`${quartosDisponiveis.length} quartos disponíveis para internação`}
              variante="success"
            />
          </>
        ) : (
          <>
            <Card
              titulo="Pacientes Cadastrados"
              valor={pacientes.length.toString()}
              descricao="Registros ativos na unidade"
              variante="primary"
            />
            <Card
              titulo="Total de Atendimentos"
              valor={consultas.length.toString()}
              descricao="Rotina, urgências e cirurgias"
            />
            <Card
              titulo="Ocupação Geral dos Leitos"
              valor={`${taxaOcupacao}%`}
              descricao={`${leitosOcupados} de ${totalLeitos} leitos ocupados`}
              variante={taxaOcupacao > 75 ? "warning" : "success"}
            />
            <Card
              titulo="Quartos com Vagas"
              valor={quartosDisponiveis.length.toString()}
              descricao={`Total de ${quartos.length} quartos monitorados`}
              variante="success"
            />
          </>
        )}
      </div>

      {/* Tabela de Atendimentos */}
      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span className="ds-card-title">
              {isMedico ? "Atendimentos Clínicos" : "Últimos Atendimentos & Consultas"}
            </span>

            {isMedico && (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("MINHAS")}
                  className={`ds-btn ds-btn-sm ${abaAtiva === "MINHAS" ? "ds-btn-primary" : "ds-btn-secondary"}`}
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Meus Atendimentos ({minhasConsultas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("TODAS")}
                  className={`ds-btn ds-btn-sm ${abaAtiva === "TODAS" ? "ds-btn-primary" : "ds-btn-secondary"}`}
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Fila Geral da Unidade ({consultas.length})
                </button>
              </div>
            )}

            {!isMedico && (
              <span className="ds-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
                Total: {consultas.length}
              </span>
            )}
          </div>

          <Link to="/dashboard/consultas" className="ds-btn ds-btn-secondary ds-btn-sm">
            Ver Fila Completa
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
                  {isMedico && <th>Ação Clínica</th>}
                </tr>
              </thead>
              <tbody>
                {consultasExibidas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isMedico ? 6 : 5}
                      style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}
                    >
                      {isMedico && abaAtiva === "MINHAS"
                        ? "Você não possui atendimentos atribuídos no momento. Novos pacientes agendados para seu plantão aparecerão aqui."
                        : "Nenhum atendimento registrado no momento."}
                    </td>
                  </tr>
                ) : (
                  consultasExibidas.slice(0, 8).map((c) => {
                    const badgeClass = `badge-${c.situacao?.toLowerCase().replace("_", "-")}`;
                    const eDoMedico = isDoctorAttending(c.profissional);

                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.paciente?.nome}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.motivo}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: eDoMedico ? 600 : 400, color: eDoMedico ? "var(--primary)" : "inherit" }}>
                            {c.profissional?.nome} {eDoMedico && "(Você)"}
                          </div>
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
                        {isMedico && (
                          <td>
                            {c.situacao === "AGENDADA" || c.situacao === "CONFIRMADA" ? (
                              <button
                                type="button"
                                onClick={() => handleAcaoRapida(c.id, "EM_ATENDIMENTO")}
                                className="ds-btn ds-btn-sm ds-btn-primary"
                                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                title="Iniciar consulta agora"
                              >
                                Iniciar
                              </button>
                            ) : c.situacao === "EM_ATENDIMENTO" ? (
                              <button
                                type="button"
                                onClick={() => handleAcaoRapida(c.id, "CONCLUIDA")}
                                className="ds-btn ds-btn-sm ds-btn-success"
                                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                title="Finalizar atendimento"
                              >
                                Concluir
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                {c.situacao === "CONCLUIDA" ? "Atendido" : "Encerrado"}
                              </span>
                            )}
                          </td>
                        )}
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
