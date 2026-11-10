import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "../../styles/forms.css";

function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  
  const [pacienteId, setPacienteId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split("T")[0]);
  const [horario, setHorario] = useState("09:00");
  const [motivo, setMotivo] = useState("");
  const [modalidade, setModalidade] = useState("ROTINA");
  const [observacoes, setObservacoes] = useState("");

  // Específicos por modalidade
  const [especialidadeRequerida, setEspecialidadeRequerida] = useState("Cardiologia");
  const [prioridadeEmergencia, setPrioridadeEmergencia] = useState("MODERADA");
  const [tipoCirurgia, setTipoCirurgia] = useState("");
  const [descricaoProcedimento, setDescricaoProcedimento] = useState("");
  const [obsPreOperatorias, setObsPreOperatorias] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [listaConsultas, listaPacientes, listaProfissionais] = await Promise.all([
        api.getConsultas(),
        api.getPacientes(),
        api.getProfissionais()
      ]);
      setConsultas(listaConsultas || []);
      setPacientes(listaPacientes || []);
      setProfissionais(listaProfissionais || []);
    } catch (err) {
      console.error(err);
    }
  }

  // Filtra profissionais de acordo com a modalidade selecionada para auxiliar o usuário
  const profissionaisFiltrados = profissionais.filter((p) => {
    if (modalidade === "PROCEDIMENTO_CIRURGICO") {
      return p.categoria === "CIRURGIAO";
    }
    if (modalidade === "ESPECIALIZADA") {
      return p.categoria === "ESPECIALISTA";
    }
    return true;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    if (!pacienteId || !profissionalId || !dataConsulta || !horario || !motivo) {
      setMensagemErro("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      pacienteId: Number(pacienteId),
      profissionalId: Number(profissionalId),
      dataConsulta,
      horario: horario.length === 5 ? horario + ":00" : horario,
      motivo,
      modalidade,
      observacoes,
      especialidadeRequerida: modalidade === "ESPECIALIZADA" ? especialidadeRequerida : null,
      prioridadeEmergencia: modalidade === "EMERGENCIA" ? prioridadeEmergencia : null,
      tipoCirurgia: modalidade === "PROCEDIMENTO_CIRURGICO" ? tipoCirurgia : null,
      descricaoProcedimento: modalidade === "PROCEDIMENTO_CIRURGICO" ? descricaoProcedimento : null,
      observacoesPreOperatorias: modalidade === "PROCEDIMENTO_CIRURGICO" ? obsPreOperatorias : null
    };

    try {
      const nova = await api.createConsulta(payload);
      setMensagemSucesso("Atendimento/Consulta agendado com sucesso!");
      setConsultas([nova, ...consultas]);
      // Limpa formulário
      setMotivo("");
      setObservacoes("");
      setTipoCirurgia("");
      setDescricaoProcedimento("");
    } catch (err) {
      setMensagemErro(err.message || "Erro ao agendar consulta. Verifique as regras de negócio.");
    }
  }

  async function handleAlterarSituacao(id, novaSituacao, obs = "") {
    setMensagemSucesso("");
    setMensagemErro("");
    try {
      const atualizada = await api.patchConsultaSituacao(id, novaSituacao, obs);
      setMensagemSucesso(`Situação atualizada para ${novaSituacao} com sucesso!`);
      setConsultas(consultas.map((c) => (c.id === id ? atualizada : c)));
    } catch (err) {
      setMensagemErro(err.message || "Não foi possível alterar a situação.");
    }
  }

  const consultasFiltradas = filtroSituacao
    ? consultas.filter((c) => c.situacao === filtroSituacao)
    : consultas;

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Atendimentos & Consultas</h1>
          <p>Gestão unificada de consultas de rotina, especializadas, emergências e cirurgias</p>
        </div>
      </div>

      {mensagemSucesso && <div className="alertaSucesso">{mensagemSucesso}</div>}
      {mensagemErro && <div className="alertaErro">{mensagemErro}</div>}

      <div className="formulario">
        <h2>Novo Atendimento / Agendamento</h2>

        <form onSubmit={handleSubmit}>
          <div className="gridFormulario">
            <div>
              <label>Modalidade de Atendimento *</label>
              <select value={modalidade} onChange={(e) => {
                setModalidade(e.target.value);
                setProfissionalId("");
              }}>
                <option value="ROTINA">Consulta de Rotina</option>
                <option value="ESPECIALIZADA">Consulta Especializada</option>
                <option value="EMERGENCIA">Atendimento de Emergência</option>
                <option value="PROCEDIMENTO_CIRURGICO">Procedimento Cirúrgico</option>
              </select>
            </div>

            <div>
              <label>Paciente *</label>
              <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
                <option value="">Selecione o paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (CPF: {p.cpf})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                Profissional Responsável *
                {modalidade === "PROCEDIMENTO_CIRURGICO" && " (Apenas Cirurgiões)"}
                {modalidade === "ESPECIALIZADA" && " (Apenas Especialistas)"}
              </label>
              <select value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}>
                <option value="">Selecione o profissional</option>
                {profissionaisFiltrados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - {p.categoria} {p.especialidade ? `(${p.especialidade})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Data *</label>
              <input type="date" value={dataConsulta} onChange={(e) => setDataConsulta(e.target.value)} />
            </div>

            <div>
              <label>Horário *</label>
              <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
            </div>

            <div>
              <label>Motivo do Atendimento *</label>
              <input
                placeholder="Ex: Check-up, dor no peito, cirurgia"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>

            {/* Campos condicionais de Consulta Especializada */}
            {modalidade === "ESPECIALIZADA" && (
              <div>
                <label>Especialidade Requerida *</label>
                <select value={especialidadeRequerida} onChange={(e) => setEspecialidadeRequerida(e.target.value)}>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Neurologia">Neurologia</option>
                  <option value="Pediatria">Pediatria</option>
                </select>
              </div>
            )}

            {/* Campos condicionais de Emergência */}
            {modalidade === "EMERGENCIA" && (
              <div>
                <label>Classificação de Prioridade *</label>
                <select value={prioridadeEmergencia} onChange={(e) => setPrioridadeEmergencia(e.target.value)}>
                  <option value="BAIXA">Baixa (Verde)</option>
                  <option value="MODERADA">Moderada (Amarela)</option>
                  <option value="ALTA">Alta (Laranja)</option>
                  <option value="CRITICA">Crítica (Vermelha - Emergência Imediata)</option>
                </select>
              </div>
            )}

            {/* Campos condicionais de Cirurgia */}
            {modalidade === "PROCEDIMENTO_CIRURGICO" && (
              <>
                <div>
                  <label>Tipo de Cirurgia *</label>
                  <input
                    placeholder="Ex: Apendicectomia, Colecistectomia"
                    value={tipoCirurgia}
                    onChange={(e) => setTipoCirurgia(e.target.value)}
                  />
                </div>
                <div>
                  <label>Descrição do Procedimento *</label>
                  <input
                    placeholder="Descrição detalhada"
                    value={descricaoProcedimento}
                    onChange={(e) => setDescricaoProcedimento(e.target.value)}
                  />
                </div>
                <div>
                  <label>Observações Pré-Operatórias</label>
                  <input
                    placeholder="Ex: Jejum 8h, avaliação cardiológica"
                    value={obsPreOperatorias}
                    onChange={(e) => setObsPreOperatorias(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="campoObservacao">
            <label>Observações Gerais / Anotações Clínicas</label>
            <textarea
              rows="3"
              placeholder="Anotações sobre o quadro do paciente..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <button type="submit" className="botaoPrincipal">
            Confirmar Agendamento / Atendimento
          </button>
        </form>
      </div>

      <div className="painel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>Atendimentos Registrados ({consultasFiltradas.length})</h2>
          <div>
            <select
              style={{ padding: "6px 12px", fontSize: "0.85rem" }}
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
            >
              <option value="">Todas as situações</option>
              <option value="AGENDADA">Agendada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NAO_COMPARECEU">Não Compareceu</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Profissional</th>
              <th>Modalidade</th>
              <th>Data/Hora</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                  Nenhum atendimento encontrado.
                </td>
              </tr>
            ) : (
              consultasFiltradas.map((c) => {
                const situacaoClass = `badge-${c.situacao.toLowerCase().replace("_", "-")}`;
                return (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.paciente?.nome || "Paciente"}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.motivo}</div>
                    </td>
                    <td>
                      {c.profissional?.nome}
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {c.profissional?.categoria}
                        {c.especialidadeRequerida ? ` (${c.especialidadeRequerida})` : ""}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "#f1f5f9", color: "#334155" }}>
                        {c.modalidade}
                      </span>
                      {c.prioridadeEmergencia && (
                        <div style={{ marginTop: "4px" }}>
                          <span className={`badge badge-prioridade-${c.prioridadeEmergencia.toLowerCase()}`}>
                            {c.prioridadeEmergencia}
                          </span>
                        </div>
                      )}
                      {c.tipoCirurgia && (
                        <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "2px" }}>
                          Cirurgia: {c.tipoCirurgia}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.dataConsulta} às {c.horario}
                    </td>
                    <td>
                      <span className={`badge ${situacaoClass}`}>
                        {c.situacao}
                      </span>
                    </td>
                    <td>
                      <div className="acoesTabela">
                        {c.situacao === "AGENDADA" && (
                          <button
                            className="btnAcao"
                            onClick={() => handleAlterarSituacao(c.id, "CONFIRMADA")}
                          >
                            Confirmar
                          </button>
                        )}
                        {(c.situacao === "AGENDADA" || c.situacao === "CONFIRMADA") && (
                          <button
                            className="btnAcao btnIniciar"
                            onClick={() => handleAlterarSituacao(c.id, "EM_ATENDIMENTO")}
                          >
                            Iniciar
                          </button>
                        )}
                        {c.situacao === "EM_ATENDIMENTO" && (
                          <button
                            className="btnAcao btnConcluir"
                            onClick={() => handleAlterarSituacao(c.id, "CONCLUIDA", "Atendimento finalizado com sucesso")}
                          >
                            Concluir
                          </button>
                        )}
                        {c.situacao !== "CONCLUIDA" && c.situacao !== "CANCELADA" && (
                          <button
                            className="btnAcao btnCancelar"
                            onClick={() => handleAlterarSituacao(c.id, "CANCELADA", "Cancelado pelo operador")}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Consultas;
