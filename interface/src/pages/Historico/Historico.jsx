import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "../../styles/forms.css";
import "./Historico.css";

function Historico() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState("");
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [consultasPaciente, setConsultasPaciente] = useState([]);
  const [internacoesPaciente, setInternacoesPaciente] = useState([]);

  useEffect(() => {
    async function carregarPacientes() {
      try {
        const dados = await api.getPacientes();
        setPacientes(dados || []);
        if (dados && dados.length > 0) {
          setPacienteSelecionadoId(dados[0].id.toString());
          selecionarPaciente(dados[0].id, dados);
        }
      } catch (err) {
        console.error(err);
      }
    }
    carregarPacientes();
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

  function handleConsultar() {
    if (pacienteSelecionadoId) {
      selecionarPaciente(pacienteSelecionadoId);
    }
  }

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Prontuário & Histórico Clínico</h1>
          <p>Linha do tempo consolidada de consultas, especialidades e internações do paciente</p>
        </div>
      </div>

      <div className="buscaHistorico">
        <label>Paciente:</label>
        <select
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

        <button className="botaoPrincipal" onClick={handleConsultar}>
          Consultar Prontuário
        </button>
      </div>

      {pacienteAtual && (
        <div className="historicoPaciente">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2>{pacienteAtual.nome}</h2>
              <p className="dadosPaciente">
                CPF: <strong>{pacienteAtual.cpf}</strong> | Nasc: {pacienteAtual.dataNascimento} | Telefone: {pacienteAtual.telefone || "N/A"}
              </p>
            </div>
            <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
              Prontuário Ativo #{pacienteAtual.id}
            </span>
          </div>

          <h3 style={{ fontSize: "1.1rem", marginTop: "10px", marginBottom: "12px", color: "var(--text-secondary)" }}>
            Linha do Tempo de Atendimentos
          </h3>

          {consultasPaciente.length === 0 && internacoesPaciente.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "16px 0" }}>
              Nenhum registro de consulta ou internação para este paciente.
            </p>
          ) : (
            <>
              {consultasPaciente.map((c) => (
                <div key={`c-${c.id}`} className="eventoHistorico">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>ATENDIMENTO: {c.modalidade}</span>
                    <span className={`badge badge-${c.situacao.toLowerCase().replace("_", "-")}`}>
                      {c.situacao}
                    </span>
                  </div>
                  <h3>{c.motivo}</h3>
                  <p>
                    📅 {c.dataConsulta} às {c.horario} &bull; Médico: <strong>{c.profissional?.nome}</strong> ({c.profissional?.categoria})
                  </p>
                  {c.especialidadeRequerida && (
                    <p>🔬 Especialidade: <strong>{c.especialidadeRequerida}</strong></p>
                  )}
                  {c.tipoCirurgia && (
                    <p>⚕️ Cirurgia: <strong>{c.tipoCirurgia}</strong> - {c.descricaoProcedimento}</p>
                  )}
                  {c.observacoes && (
                    <p style={{ fontStyle: "italic", marginTop: "6px" }}>&ldquo;{c.observacoes}&rdquo;</p>
                  )}
                </div>
              ))}

              {internacoesPaciente.map((i) => (
                <div
                  key={`i-${i.id}`}
                  className="eventoHistorico"
                  style={{ borderLeftColor: "#7c3aed" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#7c3aed" }}>INTERNAÇÃO HOSPITALAR</span>
                    <span
                      className="badge"
                      style={{
                        background: i.ativa ? "#d1fae5" : "#f1f5f9",
                        color: i.ativa ? "#065f46" : "#64748b"
                      }}
                    >
                      {i.ativa ? "Internação Ativa" : "Alta Realizada"}
                    </span>
                  </div>
                  <h3>Quarto {i.quarto?.numeroIdentificacao} ({i.quarto?.tipoQuarto})</h3>
                  <p>
                    Entrada: {new Date(i.dataEntrada).toLocaleString("pt-BR")} &bull; Responsável: <strong>{i.profissionalResponsavel?.nome}</strong>
                  </p>
                  {i.dataEfetivaAlta ? (
                    <p>Alta registrada em: {new Date(i.dataEfetivaAlta).toLocaleString("pt-BR")}</p>
                  ) : (
                    <p>Previsão de alta: {i.dataPrevistaAlta ? new Date(i.dataPrevistaAlta).toLocaleString("pt-BR") : "Acompanhamento em curso"}</p>
                  )}
                  {i.observacoes && (
                    <p style={{ fontStyle: "italic", marginTop: "6px" }}>&ldquo;{i.observacoes}&rdquo;</p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Historico;
