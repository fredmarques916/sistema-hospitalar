import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  formatSituacaoConsulta,
  formatModalidade,
  formatPrioridadeEmergencia,
  formatSituacaoProcedimento,
  formatCategoriaProfissional,
  formatCPF,
  formatData,
  formatHorario
} from "../../utils/formatters";

function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário de novo atendimento
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

  // Filtros
  const [filtroModalidade, setFiltroModalidade] = useState("TODAS");
  const [filtroSituacao, setFiltroSituacao] = useState("TODAS");

  // Feedback e Modais
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // Modal de Transição de Estado
  const [modalAberto, setModalAberto] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);
  const [acaoModal, setAcaoModal] = useState("");
  const [observacoesModal, setObservacoesModal] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setMensagemErro("");
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
      setMensagemErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  // Filtra médicos no dropdown de acordo com a modalidade
  const profissionaisDisponiveis = profissionais.filter((p) => {
    if (modalidade === "PROCEDIMENTO_CIRURGICO") return p.categoria === "CIRURGIAO";
    if (modalidade === "ESPECIALIZADA") return p.categoria === "ESPECIALISTA";
    return true;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

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
      setMensagemSucesso(`Atendimento para ${nova.paciente?.nome || "paciente"} agendado com sucesso.`);
      setConsultas([nova, ...consultas]);
      setMotivo("");
      setObservacoes("");
      setTipoCirurgia("");
      setDescricaoProcedimento("");
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  function abrirModal(consulta, acao) {
    setConsultaSelecionada(consulta);
    setAcaoModal(acao);
    setObservacoesModal("");
    setModalAberto(true);
  }

  async function handleConfirmarModal() {
    if (!consultaSelecionada) return;
    setMensagemSucesso("");
    setMensagemErro("");

    try {
      const atualizada = await api.patchConsultaSituacao(
        consultaSelecionada.id,
        acaoModal,
        observacoesModal
      );
      setMensagemSucesso(`Situação do atendimento atualizada para "${formatSituacaoConsulta(acaoModal)}" com sucesso.`);
      setConsultas(consultas.map((c) => (c.id === atualizada.id ? atualizada : c)));
      setModalAberto(false);
    } catch (err) {
      setMensagemErro(err.message);
      setModalAberto(false);
    }
  }

  async function handleAcaoRapida(id, novaSituacao) {
    setMensagemSucesso("");
    setMensagemErro("");
    try {
      const atualizada = await api.patchConsultaSituacao(id, novaSituacao);
      setMensagemSucesso(`Situação atualizada para "${formatSituacaoConsulta(novaSituacao)}" com sucesso.`);
      setConsultas(consultas.map((c) => (c.id === id ? atualizada : c)));
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Deseja realmente remover este atendimento do sistema?")) return;
    setMensagemSucesso("");
    setMensagemErro("");
    try {
      await api.deleteConsulta(id);
      setMensagemSucesso("Atendimento removido com sucesso.");
      setConsultas(consultas.filter((c) => c.id !== id));
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  const consultasFiltradas = consultas.filter((c) => {
    const matchModalidade = filtroModalidade === "TODAS" || c.modalidade === filtroModalidade;
    const matchSituacao = filtroSituacao === "TODAS" || c.situacao === filtroSituacao;
    return matchModalidade && matchSituacao;
  });

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>Atendimentos & Consultas</h1>
          <p>Gestão integrada de rotina, especialidades, pronto-socorro e procedimentos cirúrgicos</p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      {/* Formulário Novo Atendimento */}
      <div className="ds-card" style={{ marginBottom: "28px" }}>
        <div className="ds-card-header">
          <div className="ds-card-title">Novo Atendimento / Agendamento</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ds-form-grid">
            <div className="ds-field">
              <label className="ds-label">Modalidade de Atendimento *</label>
              <select
                className="ds-select"
                value={modalidade}
                onChange={(e) => {
                  setModalidade(e.target.value);
                  setProfissionalId("");
                }}
              >
                <option value="ROTINA">Consulta de Rotina</option>
                <option value="ESPECIALIZADA">Consulta Especializada</option>
                <option value="EMERGENCIA">Atendimento de Emergência</option>
                <option value="PROCEDIMENTO_CIRURGICO">Procedimento Cirúrgico</option>
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">Paciente *</label>
              <select
                className="ds-select"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                required
              >
                <option value="">Selecione o paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (CPF: {formatCPF(p.cpf)})
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">
                Profissional Responsável *
                {modalidade === "PROCEDIMENTO_CIRURGICO" && " [Cirurgiões]"}
                {modalidade === "ESPECIALIZADA" && " [Especialistas]"}
              </label>
              <select
                className="ds-select"
                value={profissionalId}
                onChange={(e) => setProfissionalId(e.target.value)}
                required
              >
                <option value="">Selecione o médico responsável</option>
                {profissionaisDisponiveis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {formatCategoriaProfissional(p.categoria)} {p.especialidade ? `(${p.especialidade})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">Data *</label>
              <input
                className="ds-input"
                type="date"
                value={dataConsulta}
                onChange={(e) => setDataConsulta(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Horário *</label>
              <input
                className="ds-input"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Motivo do Atendimento *</label>
              <input
                className="ds-input"
                placeholder="Ex: Avaliação de rotina, dores lombares"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
            </div>

            {/* Campos Dinâmicos: Especializada */}
            {modalidade === "ESPECIALIZADA" && (
              <div className="ds-field">
                <label className="ds-label">Especialidade Requerida *</label>
                <select
                  className="ds-select"
                  value={especialidadeRequerida}
                  onChange={(e) => setEspecialidadeRequerida(e.target.value)}
                >
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Neurologia">Neurologia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Dermatologia">Dermatologia</option>
                </select>
              </div>
            )}

            {/* Campos Dinâmicos: Emergência */}
            {modalidade === "EMERGENCIA" && (
              <div className="ds-field">
                <label className="ds-label">Classificação de Risco (Manchester) *</label>
                <select
                  className="ds-select"
                  value={prioridadeEmergencia}
                  onChange={(e) => setPrioridadeEmergencia(e.target.value)}
                >
                  <option value="BAIXA">Baixa (Verde — Não urgente)</option>
                  <option value="MODERADA">Moderada (Amarela — Urgente)</option>
                  <option value="ALTA">Alta (Laranja — Muito urgente)</option>
                  <option value="CRITICA">Crítica (Vermelha — Emergência Imediata)</option>
                </select>
              </div>
            )}

            {/* Campos Dinâmicos: Procedimento Cirúrgico */}
            {modalidade === "PROCEDIMENTO_CIRURGICO" && (
              <>
                <div className="ds-field">
                  <label className="ds-label">Tipo de Cirurgia *</label>
                  <input
                    className="ds-input"
                    placeholder="Ex: Apendicectomia, Artroscopia"
                    value={tipoCirurgia}
                    onChange={(e) => setTipoCirurgia(e.target.value)}
                    required
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Descrição do Procedimento *</label>
                  <input
                    className="ds-input"
                    placeholder="Detalhes técnicos da intervenção"
                    value={descricaoProcedimento}
                    onChange={(e) => setDescricaoProcedimento(e.target.value)}
                    required
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Observações Pré-Operatórias</label>
                  <input
                    className="ds-input"
                    placeholder="Ex: Jejum 8h, exames de coagulação OK"
                    value={obsPreOperatorias}
                    onChange={(e) => setObsPreOperatorias(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="ds-field" style={{ marginTop: "16px" }}>
            <label className="ds-label">Observações Clínicas / Histórico Prévio</label>
            <textarea
              className="ds-textarea"
              rows="2"
              placeholder="Anotações adicionais do paciente..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <button type="submit" className="ds-btn ds-btn-primary">
              Confirmar Agendamento / Registro
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Atendimentos */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">
            <span>Atendimentos Cadastrados ({consultasFiltradas.length})</span>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="ds-select"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.8rem" }}
              value={filtroModalidade}
              onChange={(e) => setFiltroModalidade(e.target.value)}
            >
              <option value="TODAS">Todas Modalidades</option>
              <option value="ROTINA">Rotina</option>
              <option value="ESPECIALIZADA">Especializada</option>
              <option value="EMERGENCIA">Emergência</option>
              <option value="PROCEDIMENTO_CIRURGICO">Cirurgia</option>
            </select>

            <select
              className="ds-select"
              style={{ width: "auto", padding: "6px 12px", fontSize: "0.8rem" }}
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
            >
              <option value="TODAS">Todas Situações</option>
              <option value="AGENDADA">Agendada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NAO_COMPARECEU">Não Compareceu</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Carregando atendimentos...
          </div>
        ) : (
          <div className="ds-table-container">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Médico Responsável</th>
                  <th>Modalidade & Detalhes</th>
                  <th>Data & Horário</th>
                  <th>Situação</th>
                  <th>Ações de Fluxo</th>
                </tr>
              </thead>
              <tbody>
                {consultasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Nenhum atendimento correspondente aos filtros.
                    </td>
                  </tr>
                ) : (
                  consultasFiltradas.map((c) => {
                    const situacaoBadge = `badge-${c.situacao?.toLowerCase().replace("_", "-")}`;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.paciente?.nome}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.motivo}</div>
                        </td>
                        <td>
                          <div>{c.profissional?.nome}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {formatCategoriaProfissional(c.profissional?.categoria)} {c.profissional?.especialidade ? `• ${c.profissional.especialidade}` : ""}
                          </div>
                        </td>
                        <td>
                          <span className="ds-badge" style={{ background: "#f1f5f9", color: "#334155" }}>
                            {formatModalidade(c.modalidade)}
                          </span>
                          {c.prioridadeEmergencia && (
                            <div style={{ marginTop: "4px" }}>
                              <span className="ds-badge" style={{
                                background: c.prioridadeEmergencia === "CRITICA" ? "#fee2e2" : "#fffbeb",
                                color: c.prioridadeEmergencia === "CRITICA" ? "#dc2626" : "#b45309"
                              }}>
                                Prioridade: {formatPrioridadeEmergencia(c.prioridadeEmergencia)}
                              </span>
                            </div>
                          )}
                          {c.tipoCirurgia && (
                            <div style={{ fontSize: "0.75rem", color: "var(--surgery-text)", marginTop: "2px" }}>
                              Cirurgia: <strong>{c.tipoCirurgia}</strong>
                              {c.situacaoProcedimento && ` • ${formatSituacaoProcedimento(c.situacaoProcedimento)}`}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="tabular-nums">{formatData(c.dataConsulta)}</span> às <span className="tabular-nums">{formatHorario(c.horario)}</span>
                        </td>
                        <td>
                          <span className={`ds-badge ${situacaoBadge}`}>
                            {formatSituacaoConsulta(c.situacao)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {c.situacao === "AGENDADA" && (
                              <button
                                className="ds-btn ds-btn-sm ds-btn-secondary"
                                onClick={() => handleAcaoRapida(c.id, "CONFIRMADA")}
                              >
                                Confirmar
                              </button>
                            )}
                            {(c.situacao === "AGENDADA" || c.situacao === "CONFIRMADA") && (
                              <button
                                className="ds-btn ds-btn-sm"
                                style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                                onClick={() => handleAcaoRapida(c.id, "EM_ATENDIMENTO")}
                              >
                                Iniciar
                              </button>
                            )}
                            {c.situacao === "EM_ATENDIMENTO" && (
                              <button
                                className="ds-btn ds-btn-sm"
                                style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                                onClick={() => abrirModal(c, "CONCLUIDA")}
                              >
                                Concluir
                              </button>
                            )}
                            {c.situacao !== "CONCLUIDA" && c.situacao !== "CANCELADA" && (
                              <button
                                className="ds-btn ds-btn-sm ds-btn-secondary"
                                style={{ color: "var(--danger)" }}
                                onClick={() => abrirModal(c, "CANCELADA")}
                              >
                                Cancelar
                              </button>
                            )}
                            {c.situacao !== "CONCLUIDA" && (
                              <button
                                className="ds-btn ds-btn-sm"
                                style={{ background: "transparent", color: "var(--text-dim)", border: "none" }}
                                title="Excluir atendimento"
                                onClick={() => handleExcluir(c.id)}
                              >
                                ✕
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
        )}
      </div>

      {/* Modal Semântico de Conclusão / Cancelamento */}
      {modalAberto && (
        <div className="ds-modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-modal-header">
              <h3>
                {acaoModal === "CONCLUIDA" ? "Concluir Atendimento Clínico" : "Cancelar Atendimento"}
              </h3>
              <button
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setModalAberto(false)}
              >
                ✕
              </button>
            </div>
            <div className="ds-modal-body">
              <p style={{ fontSize: "0.885rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Paciente: <strong>{consultaSelecionada?.paciente?.nome}</strong> &bull; Modalidade:{" "}
                <strong>{formatModalidade(consultaSelecionada?.modalidade)}</strong>
              </p>

              <div className="ds-field">
                <label className="ds-label">
                  {acaoModal === "CONCLUIDA" ? "Anotações Médicas / Diagnóstico *" : "Motivo do Cancelamento *"}
                </label>
                <textarea
                  className="ds-textarea"
                  rows="4"
                  placeholder={
                    acaoModal === "CONCLUIDA"
                      ? "Informe as observações de encerramento da consulta ou pós-cirúrgico..."
                      : "Informe o motivo do cancelamento para registro em auditoria..."
                  }
                  value={observacoesModal}
                  onChange={(e) => setObservacoesModal(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="ds-modal-footer">
              <button className="ds-btn ds-btn-secondary" onClick={() => setModalAberto(false)}>
                Voltar
              </button>
              <button
                className={`ds-btn ${acaoModal === "CONCLUIDA" ? "ds-btn-primary" : "ds-btn-danger"}`}
                onClick={handleConfirmarModal}
              >
                {acaoModal === "CONCLUIDA" ? "Salvar & Concluir" : "Confirmar Cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Consultas;
