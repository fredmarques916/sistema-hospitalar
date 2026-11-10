import { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  formatTipoQuarto,
  formatCategoriaProfissional,
  formatCPF,
  formatDataHora
} from "../../utils/formatters";

function Internacoes() {
  const [internacoes, setInternacoes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Formulário
  const [pacienteId, setPacienteId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [quartoId, setQuartoId] = useState("");
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().slice(0, 16));
  const [dataPrevistaAlta, setDataPrevistaAlta] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Filtros
  const [filtroApenasAtivas, setFiltroApenasAtivas] = useState(true);
  const [filtroMinhas, setFiltroMinhas] = useState(false);

  // Modais e Feedback
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [modalAltaAberto, setModalAltaAberto] = useState(false);
  const [internacaoSelecionada, setInternacaoSelecionada] = useState(null);
  const [observacoesAlta, setObservacoesAlta] = useState("");

  useEffect(() => {
    const user = api.obterSessao();
    setUsuario(user);
    if (user?.cargo === "Médico Clínico") {
      setFiltroMinhas(true);
    }
    carregarDados(user);
  }, [filtroApenasAtivas]);

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

  async function carregarDados(userAtual) {
    setCarregando(true);
    setMensagemErro("");
    try {
      const [listaInternacoes, listaPacientes, listaProfissionais, listaQuartos] = await Promise.all([
        api.getInternacoes(filtroApenasAtivas ? "apenasAtivas=true" : ""),
        api.getPacientes(),
        api.getProfissionais(),
        api.getQuartos()
      ]);
      setInternacoes(listaInternacoes || []);
      setPacientes(listaPacientes || []);
      setProfissionais(listaProfissionais || []);
      setQuartos(listaQuartos || []);

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

  const quartosDisponiveis = quartos.filter((q) => q.disponivel);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    const payload = {
      pacienteId: Number(pacienteId),
      profissionalId: Number(profissionalId),
      quartoId: Number(quartoId),
      dataEntrada: dataEntrada ? dataEntrada + ":00" : null,
      dataPrevistaAlta: dataPrevistaAlta ? dataPrevistaAlta + ":00" : null,
      observacoes
    };

    try {
      const nova = await api.createInternacao(payload);
      setMensagemSucesso(`Internação de ${nova.paciente?.nome} no Quarto ${nova.quarto?.numeroIdentificacao} registrada com sucesso.`);
      carregarDados();
      setPacienteId("");
      if (!isMedico) setProfissionalId("");
      setQuartoId("");
      setObservacoes("");
      setDataPrevistaAlta("");
    } catch (err) {
      setMensagemErro(err.message);
    }
  }

  function abrirModalAlta(internacao) {
    setInternacaoSelecionada(internacao);
    setObservacoesAlta("Paciente clinicamente estável, plano terapêutico concluído com sucesso. Alta médica autorizada.");
    setModalAltaAberto(true);
  }

  async function handleConfirmarAlta() {
    if (!internacaoSelecionada) return;
    setMensagemSucesso("");
    setMensagemErro("");

    try {
      await api.registrarAlta(internacaoSelecionada.id, observacoesAlta);
      setMensagemSucesso(`Alta médica de ${internacaoSelecionada.paciente?.nome} confirmada com sucesso. O leito foi liberado.`);
      setModalAltaAberto(false);
      carregarDados();
    } catch (err) {
      setMensagemErro(err.message);
      setModalAltaAberto(false);
    }
  }

  const internacoesExibidas = internacoes.filter((i) => {
    if (isMedico && filtroMinhas) {
      return isDoctorAttending(i.profissionalResponsavel);
    }
    return true;
  });

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-title">
          <h1>{isMedico ? "Internações & Altas Supervisionadas" : "Internações Hospitalares"}</h1>
          <p>
            {isMedico
              ? "Prescrição de internação em leitos disponíveis e autorização de alta médica supervisionada"
              : "Gestão executiva de admissões, ocupação de leitos e altas médicas hospitalares"}
          </p>
        </div>
      </div>

      {mensagemSucesso && <div className="ds-alert ds-alert-success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="ds-alert ds-alert-danger">{mensagemErro}</div>}

      <div className="ds-card" style={{ marginBottom: "28px" }}>
        <div className="ds-card-header">
          <div className="ds-card-title">
            {isMedico ? "Prescrever Nova Internação Hospitalar" : "Admitir Paciente para Internação"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ds-form-grid">
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
                    {p.nome} (CPF: {p.cpf})
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">
                Médico Assistente Responsável *
                {isMedico && " (Você está pré-selecionado)"}
              </label>
              <select
                className="ds-select"
                value={profissionalId}
                onChange={(e) => setProfissionalId(e.target.value)}
                required
              >
                <option value="">Selecione o médico</option>
                {profissionais.map((p) => {
                  const eLogado = isDoctorAttending(p);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.nome} {eLogado ? "(Você)" : ""} — {formatCategoriaProfissional(p.categoria)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">Quarto / Leito Disponível *</label>
              <select
                className="ds-select"
                value={quartoId}
                onChange={(e) => setQuartoId(e.target.value)}
                required
              >
                <option value="">Selecione um quarto com vagas</option>
                {quartosDisponiveis.map((q) => (
                  <option key={q.id} value={q.id}>
                    Quarto {q.numeroIdentificacao} ({formatTipoQuarto(q.tipoQuarto)} &bull; Andar {q.andar} &bull; {q.quantidadeOcupantes}/{q.capacidadeMaxima} leitos)
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">Data e Horário de Entrada *</label>
              <input
                className="ds-input"
                type="datetime-local"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                required
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Previsão de Alta</label>
              <input
                className="ds-input"
                type="datetime-local"
                value={dataPrevistaAlta}
                onChange={(e) => setDataPrevistaAlta(e.target.value)}
              />
            </div>
          </div>

          <div className="ds-field" style={{ marginTop: "16px" }}>
            <label className="ds-label">Indicação Clínica da Admissão</label>
            <textarea
              className="ds-textarea"
              rows="2"
              placeholder="Descreva o quadro do paciente na admissão hospitalar..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <button type="submit" className="ds-btn ds-btn-primary">
              Confirmar Admissão & Ocupar Leito
            </button>
          </div>
        </form>
      </div>

      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div className="ds-card-title">Internações Hospitalares ({internacoesExibidas.length})</div>

            {isMedico && (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className={`ds-btn ds-btn-sm ${filtroMinhas ? "ds-btn-primary" : "ds-btn-secondary"}`}
                  onClick={() => setFiltroMinhas(true)}
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Minhas Internações
                </button>
                <button
                  type="button"
                  className={`ds-btn ds-btn-sm ${!filtroMinhas ? "ds-btn-primary" : "ds-btn-secondary"}`}
                  onClick={() => setFiltroMinhas(false)}
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Todas da Unidade
                </button>
              </div>
            )}
          </div>

          <div className="ds-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`ds-tab ${filtroApenasAtivas ? "active" : ""}`}
              onClick={() => setFiltroApenasAtivas(true)}
            >
              Apenas Internados
            </button>
            <button
              className={`ds-tab ${!filtroApenasAtivas ? "active" : ""}`}
              onClick={() => setFiltroApenasAtivas(false)}
            >
              Histórico Completo (com Altas)
            </button>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Carregando internações...
          </div>
        ) : (
          <div className="ds-table-container">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Médico Assistente</th>
                  <th>Leito / Quarto</th>
                  <th>Data de Entrada</th>
                  <th>Previsão / Alta</th>
                  <th>Status</th>
                  <th>Conduta</th>
                </tr>
              </thead>
              <tbody>
                {internacoesExibidas.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Nenhuma internação hospitalar registrada com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  internacoesExibidas.map((i) => {
                    const eDoMedico = isDoctorAttending(i.profissionalResponsavel);
                    return (
                      <tr key={i.id}>
                        <td>
                          <strong>{i.paciente?.nome}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            CPF: {formatCPF(i.paciente?.cpf)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: eDoMedico ? 600 : 400, color: eDoMedico ? "var(--primary)" : "inherit" }}>
                            {i.profissionalResponsavel?.nome} {eDoMedico && "(Você)"}
                          </div>
                        </td>
                        <td>
                          <span className="ds-badge" style={{ background: "#f1f5f9", color: "#334155" }}>
                            Quarto {i.quarto?.numeroIdentificacao} ({formatTipoQuarto(i.quarto?.tipoQuarto)})
                          </span>
                        </td>
                        <td>
                          <span className="tabular-nums">
                            {formatDataHora(i.dataEntrada)}
                          </span>
                        </td>
                        <td>
                          {i.dataEfetivaAlta ? (
                            <span style={{ color: "var(--success)" }}>
                              Alta: {formatDataHora(i.dataEfetivaAlta)}
                            </span>
                          ) : i.dataPrevistaAlta ? (
                            <span className="tabular-nums">
                              {formatDataHora(i.dataPrevistaAlta)}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>Em Acompanhamento</span>
                          )}
                        </td>
                        <td>
                          <span
                            className="ds-badge"
                            style={{
                              background: i.ativa ? "var(--success-subtle)" : "#f1f5f9",
                              color: i.ativa ? "var(--success-text)" : "#64748b"
                            }}
                          >
                            {i.ativa ? "Internado" : "Alta Realizada"}
                          </span>
                        </td>
                        <td>
                          {i.ativa && (
                            <button
                              className="ds-btn ds-btn-sm"
                              style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                              onClick={() => abrirModalAlta(i)}
                              title="Registrar alta médica hospitalar"
                            >
                              Dar Alta
                            </button>
                          )}
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

      {/* Modal de Alta Hospitalar */}
      {modalAltaAberto && (
        <div className="ds-modal-backdrop" onClick={() => setModalAltaAberto(false)}>
          <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-modal-header">
              <h3>Registrar Alta Médica Hospitalar</h3>
              <button
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setModalAltaAberto(false)}
              >
                ✕
              </button>
            </div>
            <div className="ds-modal-body">
              <p style={{ fontSize: "0.885rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Paciente: <strong>{internacaoSelecionada?.paciente?.nome}</strong> &bull; Quarto:{" "}
                <strong>{internacaoSelecionada?.quarto?.numeroIdentificacao}</strong>
              </p>
              <div className="ds-field">
                <label className="ds-label">Observações e Orientações de Alta *</label>
                <textarea
                  className="ds-textarea"
                  rows="4"
                  placeholder="Orientações de medicação, cuidados domiciliares..."
                  value={observacoesAlta}
                  onChange={(e) => setObservacoesAlta(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="ds-modal-footer">
              <button className="ds-btn ds-btn-secondary" onClick={() => setModalAltaAberto(false)}>
                Cancelar
              </button>
              <button className="ds-btn ds-btn-primary" onClick={handleConfirmarAlta}>
                Confirmar Alta & Desocupar Leito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Internacoes;
