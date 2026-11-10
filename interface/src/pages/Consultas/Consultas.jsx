import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

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
  const [filtroAba, setFiltroAba] = useState("TODAS");
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
    const user = api.obterSessao();
    setUsuario(user);
    if (user?.cargo === "Médico Clínico") {
      setFiltroAba("MINHAS");
    }

    // Suporte a query params da URL (ex: ?emergencia=true)
    const params = new URLSearchParams(location.search);
    if (params.get("emergencia") === "true") {
      setFiltroAba("EMERGENCIA");
      setModalidade("EMERGENCIA");
    } else if (params.get("minhas") === "true") {
      setFiltroAba("MINHAS");
    }

    carregarDados(user);
  }, [location.search]);

  async function carregarDados(userAtual) {
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

      // Se for médico e estiver em modalidade ROTINA, auto-seleciona ele mesmo
      const sessao = userAtual || api.obterSessao();
      if (sessao?.cargo === "Médico Clínico") {
        const medico = (listaProfissionais || []).find((p) => {
          if (p.email && sessao.email && p.email.toLowerCase() === sessao.email.toLowerCase()) return true;
          if (p.nome && sessao.nome) {
            const pClean = p.nome.toLowerCase().replace(/dr(a)?\.\s*/i, "").trim();
            const uClean = sessao.nome.toLowerCase().replace(/dr(a)?\.\s*/i, "").trim();
            if (pClean && uClean && (pClean.includes(uClean) || uClean.includes(pClean))) return true;
          }
          return false;
        });
        if (medico) {
          setProfissionalId(medico.id.toString());
        }
      }
    } catch (err) {
      setMensagemErro(err.message);
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
    if (!isAdmin) {
      alert("Apenas administradores hospitalares possuem autorização para excluir atendimentos.");
      return;
    }
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

  const totalMinhas = consultas.filter((c) => isDoctorAttending(c.profissional)).length;
  const totalEmergencias = consultas.filter((c) => c.modalidade === "EMERGENCIA").length;

  const consultasFiltradas = consultas.filter((c) => {
    if (filtroAba === "MINHAS" && !isDoctorAttending(c.profissional)) return false;
    if (filtroAba === "EMERGENCIA" && c.modalidade !== "EMERGENCIA") return false;
    const matchModalidade = filtroModalidade === "TODAS" || c.modalidade === filtroModalidade;
    const matchSituacao = filtroSituacao === "TODAS" || c.situacao === filtroSituacao;
    return matchModalidade && matchSituacao;
  });

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>{isMedico ? "Meus Atendimentos & Fila Clínica" : "Atendimentos & Consultas"}</h1>
          <p>
            {isMedico
              ? "Pronto-atendimento, consultas ambulatoriais e acompanhamento de seus pacientes"
              : "Gestão integrada de rotina, especialidades, pronto-socorro e procedimentos cirúrgicos"}
          </p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      {/* Formulário Novo Atendimento */}
      <div className="ds-card" style={{ marginBottom: "28px" }}>
        <div className="ds-card-header">
          <div className="ds-card-title">
            {isMedico ? "Novo Atendimento / Encaminhamento Clínico" : "Novo Atendimento / Agendamento"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ds-form-grid">
            <div className="ds-field">
              <label className="ds-label">Modalidade de Atendimento *</label>
              <select
                className="ds-select"
                value={modalidade}
                onChange={(e) => {
                  const novaModalidade = e.target.value;
                  setModalidade(novaModalidade);
                  if (novaModalidade === "ROTINA" && isMedico) {
                    const medico = profissionais.find((p) => isDoctorAttending(p));
                    if (medico) setProfissionalId(medico.id.toString());
                  } else {
                    setProfissionalId("");
                  }
                }}
              >
                <option value="ROTINA">Consulta de Rotina</option>
                <option value="ESPECIALIZADA">Consulta Especializada (Encaminhamento)</option>
                <option value="EMERGENCIA">Atendimento de Emergência (Pronto-Socorro)</option>
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
                {modalidade === "ESPECIALIZADA"
                  ? "Especialista para Encaminhamento *"
                  : modalidade === "PROCEDIMENTO_CIRURGICO"
                  ? "Cirurgião Responsável *"
                  : "Profissional Responsável *"}
                {isMedico && modalidade === "ROTINA" && " (Você está pré-selecionado)"}
              </label>
              <select
                className="ds-select"
                value={profissionalId}
                onChange={(e) => setProfissionalId(e.target.value)}
                required
              >
                <option value="">Selecione o médico responsável</option>
                {profissionaisDisponiveis.map((p) => {
                  const eLogado = isDoctorAttending(p);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.nome} {eLogado ? "(Você)" : ""} — {formatCategoriaProfissional(p.categoria)}{" "}
                      {p.especialidade ? `(${p.especialidade})` : ""}
                    </option>
                  );
                })}
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
              <label className="ds-label">Motivo do Atendimento / Queixa Principal *</label>
              <input
                className="ds-input"
                type="text"
                placeholder="Ex: Cefaleia recorrente, dor torácica, revisão laboratorial"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
            </div>

            {/* Campos Dinâmicos por Modalidade */}
            {modalidade === "ESPECIALIZADA" && (
              <div className="ds-field">
                <label className="ds-label">Especialidade Solicitada *</label>
                <select
                  className="ds-select"
                  value={especialidadeRequerida}
                  onChange={(e) => setEspecialidadeRequerida(e.target.value)}
                  required
                >
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Neurologia">Neurologia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ginecologia">Ginecologia</option>
                </select>
              </div>
            )}

            {modalidade === "EMERGENCIA" && (
              <div className="ds-field">
                <label className="ds-label">Classificação de Risco (Manchester) *</label>
                <select
                  className="ds-select"
                  value={prioridadeEmergencia}
                  onChange={(e) => setPrioridadeEmergencia(e.target.value)}
                  required
                >
                  <option value="BAIXA">Verde — Pouco Urgente (Baixa)</option>
                  <option value="MODERADA">Amarelo — Urgente (Moderada)</option>
                  <option value="ALTA">Laranja — Muito Urgente (Alta)</option>
                  <option value="CRITICA">Vermelho — Emergência Imediata (Crítica)</option>
                </select>
              </div>
            )}

            {modalidade === "PROCEDIMENTO_CIRURGICO" && (
              <>
                <div className="ds-field">
                  <label className="ds-label">Tipo de Cirurgia *</label>
                  <input
                    className="ds-input"
                    type="text"
                    placeholder="Ex: Apendicectomia, Artroscopia, Colecistectomia"
                    value={tipoCirurgia}
                    onChange={(e) => setTipoCirurgia(e.target.value)}
                    required
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Descrição do Procedimento *</label>
                  <input
                    className="ds-input"
                    type="text"
                    placeholder="Ex: Remoção laparoscópica sob anestesia geral"
                    value={descricaoProcedimento}
                    onChange={(e) => setDescricaoProcedimento(e.target.value)}
                    required
                  />
                </div>
                <div className="ds-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="ds-label">Orientações Pré-Operatórias (Jejum, exames, etc.)</label>
                  <input
                    className="ds-input"
                    type="text"
                    placeholder="Ex: Jejum de 8h, coagulograma em mãos, suspender AAS 7 dias antes"
                    value={obsPreOperatorias}
                    onChange={(e) => setObsPreOperatorias(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="ds-field" style={{ gridColumn: "1 / -1" }}>
              <label className="ds-label">Observações Clínicas Gerais</label>
              <textarea
                className="ds-textarea"
                rows="2"
                placeholder="Histórico prévio, alergias informadas ou observações de triagem..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="ds-btn ds-btn-primary">
              {isMedico ? "Registrar Atendimento" : "Salvar Agendamento"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista com Abas e Filtros Contextuais */}
      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div className="ds-card-title">Fila de Atendimentos</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {isMedico && (
                <button
                  type="button"
                  onClick={() => setFiltroAba("MINHAS")}
                  className={`ds-btn ds-btn-sm ${filtroAba === "MINHAS" ? "ds-btn-primary" : "ds-btn-secondary"}`}
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Meus Atendimentos ({totalMinhas})
                </button>
              )}
              <button
                type="button"
                onClick={() => setFiltroAba("EMERGENCIA")}
                className={`ds-btn ds-btn-sm ${filtroAba === "EMERGENCIA" ? "ds-btn-primary" : "ds-btn-secondary"}`}
                style={{ padding: "4px 10px", fontSize: "0.8rem" }}
              >
                Pronto-Socorro / Urgência ({totalEmergencias})
              </button>
              <button
                type="button"
                onClick={() => setFiltroAba("TODAS")}
                className={`ds-btn ds-btn-sm ${filtroAba === "TODAS" ? "ds-btn-primary" : "ds-btn-secondary"}`}
                style={{ padding: "4px 10px", fontSize: "0.8rem" }}
              >
                Todos ({consultas.length})
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="ds-select"
              style={{ width: "auto", fontSize: "0.825rem", padding: "6px 10px" }}
              value={filtroModalidade}
              onChange={(e) => setFiltroModalidade(e.target.value)}
            >
              <option value="TODAS">Todas Modalidades</option>
              <option value="ROTINA">Rotina</option>
              <option value="ESPECIALIZADA">Especializada</option>
              <option value="EMERGENCIA">Emergência</option>
              <option value="PROCEDIMENTO_CIRURGICO">Cirúrgico</option>
            </select>

            <select
              className="ds-select"
              style={{ width: "auto", fontSize: "0.825rem", padding: "6px 10px" }}
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
            >
              <option value="TODAS">Todas Situações</option>
              <option value="AGENDADA">Agendada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NAO_COMPARECEU">Não compareceu</option>
            </select>
          </div>
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
                  <th>Médico Responsável</th>
                  <th>Modalidade</th>
                  <th>Data & Horário</th>
                  <th>Situação</th>
                  <th>Ações Clínicas</th>
                </tr>
              </thead>
              <tbody>
                {consultasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                      {filtroAba === "MINHAS"
                        ? "Você não possui atendimentos atribuídos com os filtros atuais."
                        : "Nenhum atendimento encontrado."}
                    </td>
                  </tr>
                ) : (
                  consultasFiltradas.map((c) => {
                    const badgeClass = `badge-${c.situacao?.toLowerCase().replace("_", "-")}`;
                    const eDoMedico = isDoctorAttending(c.profissional);

                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.paciente?.nome}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.motivo}</div>
                          {c.tipoCirurgia && (
                            <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "2px" }}>
                              Cirurgia: {c.tipoCirurgia}
                            </div>
                          )}
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
                            <span
                              className="ds-badge"
                              style={{
                                marginLeft: "6px",
                                background: c.prioridadeEmergencia === "CRITICA" ? "#fee2e2" : "#fef3c7",
                                color: c.prioridadeEmergencia === "CRITICA" ? "#dc2626" : "#b45309"
                              }}
                            >
                              {formatPrioridadeEmergencia(c.prioridadeEmergencia)}
                            </span>
                          )}
                          {c.statusProcedimento && (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {formatSituacaoProcedimento(c.statusProcedimento)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="tabular-nums">{formatData(c.dataConsulta)}</span> às{" "}
                          <span className="tabular-nums">{formatHorario(c.horario)}</span>
                        </td>
                        <td>
                          <span className={`ds-badge ${badgeClass}`}>
                            {formatSituacaoConsulta(c.situacao)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {c.situacao === "AGENDADA" && (
                              <button
                                className="ds-btn ds-btn-sm ds-btn-secondary"
                                onClick={() => handleAcaoRapida(c.id, "CONFIRMADA")}
                                title="Confirmar presença do paciente"
                              >
                                Confirmar
                              </button>
                            )}
                            {(c.situacao === "AGENDADA" || c.situacao === "CONFIRMADA") && (
                              <>
                                <button
                                  className="ds-btn ds-btn-sm"
                                  style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                                  onClick={() => handleAcaoRapida(c.id, "EM_ATENDIMENTO")}
                                  title="Iniciar consulta agora"
                                >
                                  Iniciar
                                </button>
                                <button
                                  className="ds-btn ds-btn-sm ds-btn-secondary"
                                  onClick={() => handleAcaoRapida(c.id, "NAO_COMPARECEU")}
                                  title="Registrar que o paciente não compareceu"
                                >
                                  Falta
                                </button>
                              </>
                            )}
                            {c.situacao === "EM_ATENDIMENTO" && (
                              <button
                                className="ds-btn ds-btn-sm"
                                style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                                onClick={() => abrirModal(c, "CONCLUIDA")}
                                title="Concluir atendimento e registrar prontuário"
                              >
                                Concluir
                              </button>
                            )}
                            {c.situacao !== "CONCLUIDA" && c.situacao !== "CANCELADA" && c.situacao !== "NAO_COMPARECEU" && (
                              <button
                                className="ds-btn ds-btn-sm ds-btn-secondary"
                                style={{ color: "var(--danger)" }}
                                onClick={() => abrirModal(c, "CANCELADA")}
                                title="Cancelar agendamento"
                              >
                                Cancelar
                              </button>
                            )}

                            {/* Exclusão restrita a Administrador */}
                            {isAdmin && c.situacao !== "CONCLUIDA" && (
                              <button
                                className="ds-btn ds-btn-sm"
                                style={{ background: "transparent", color: "var(--text-dim)", border: "none" }}
                                title="Remover agendamento (Apenas Administrador)"
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

      {/* Modal de Conclusão / Cancelamento */}
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
                  {acaoModal === "CONCLUIDA" ? "Anotações Clínicas / Conduta do Atendimento *" : "Motivo do Cancelamento *"}
                </label>
                <textarea
                  className="ds-textarea"
                  rows="4"
                  placeholder={
                    acaoModal === "CONCLUIDA"
                      ? "Informe as observações de encerramento da consulta, conduta terapêutica ou orientações prescritas..."
                      : "Informe o motivo do cancelamento para registro administrativo..."
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
