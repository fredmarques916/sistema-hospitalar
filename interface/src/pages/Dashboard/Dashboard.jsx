import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import { api } from "../../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [internacoes, setInternacoes] = useState([]);
  const [quartos, setQuartos] = useState([]);

  useEffect(() => {
    async function carregarDashboard() {
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
        console.error(err);
      }
    }
    carregarDashboard();
  }, []);

  const internacoesAtivas = internacoes.filter((i) => i.ativa);
  const quartosDisponiveis = quartos.filter((q) => q.disponivel);
  const emergenciasAtivas = consultas.filter(
    (c) => c.modalidade === "EMERGENCIA" && c.situacao !== "CONCLUIDA" && c.situacao !== "CANCELADA"
  );

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Painel de Controle Hospitalar</h1>
          <p>Visão executiva em tempo real de atendimentos, leitos e emergências</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/dashboard/consultas" className="botaoPrincipal" style={{ textDecoration: "none", marginTop: 0 }}>
            + Novo Atendimento
          </Link>
        </div>
      </div>

      {emergenciasAtivas.length > 0 && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecdd3",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>🚨</span>
            <div>
              <strong style={{ color: "#991b1b" }}>
                {emergenciasAtivas.length} Atendimento(s) de Emergência Ativo(s)
              </strong>
              <div style={{ fontSize: "0.88rem", color: "#b91c1c" }}>
                Verifique a triagem imediata no módulo de atendimentos.
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/consultas"
            style={{
              background: "#dc2626",
              color: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600
            }}
          >
            Ver Emergências
          </Link>
        </div>
      )}

      <div className="cardsDashboard">
        <Card
          titulo="Pacientes Registrados"
          valor={pacientes.length.toString()}
          descricao="Base cadastral ativa"
        />

        <Card
          titulo="Consultas & Procedimentos"
          valor={consultas.length.toString()}
          descricao="Total de agendamentos"
        />

        <Card
          titulo="Internações em Andamento"
          valor={internacoesAtivas.length.toString()}
          descricao="Pacientes em leitos"
        />

        <Card
          titulo="Quartos Disponíveis"
          valor={quartosDisponiveis.length.toString()}
          descricao={`De um total de ${quartos.length} quartos`}
        />
      </div>

      <div className="painel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>Próximos Atendimentos & Consultas</h2>
          <Link to="/dashboard/consultas" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
            Ver todos &rarr;
          </Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Modalidade</th>
              <th>Data/Hora</th>
              <th>Situação</th>
            </tr>
          </thead>

          <tbody>
            {consultas.slice(0, 5).map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.paciente?.nome}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.motivo}</div>
                </td>
                <td>
                  {c.profissional?.nome}
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {c.profissional?.especialidade || c.profissional?.categoria}
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ background: "#f1f5f9", color: "#334155" }}>
                    {c.modalidade}
                  </span>
                </td>
                <td>{c.dataConsulta} às {c.horario}</td>
                <td>
                  <span className={`badge badge-${c.situacao.toLowerCase().replace("_", "-")}`}>
                    {c.situacao}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
