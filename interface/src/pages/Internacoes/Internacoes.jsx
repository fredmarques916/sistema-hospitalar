import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "../../styles/forms.css";

function Internacoes() {
  const [internacoes, setInternacoes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [quartos, setQuartos] = useState([]);

  const [pacienteId, setPacienteId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [quartoId, setQuartoId] = useState("");
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().slice(0, 16));
  const [dataPrevistaAlta, setDataPrevistaAlta] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [filtroAtivas, setFiltroAtivas] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [filtroAtivas]);

  async function carregarDados() {
    try {
      const [listaInternacoes, listaPacientes, listaProfissionais, listaQuartos] = await Promise.all([
        api.getInternacoes(filtroAtivas ? "apenasAtivas=true" : ""),
        api.getPacientes(),
        api.getProfissionais(),
        api.getQuartos()
      ]);
      setInternacoes(listaInternacoes || []);
      setPacientes(listaPacientes || []);
      setProfissionais(listaProfissionais || []);
      setQuartos(listaQuartos || []);
    } catch (err) {
      console.error(err);
    }
  }

  const quartosDisponiveis = quartos.filter((q) => q.disponivel);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    if (!pacienteId || !profissionalId || !quartoId) {
      setMensagemErro("Selecione o paciente, o profissional responsável e o quarto.");
      return;
    }

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
      setMensagemSucesso(`Internação registrada com sucesso para ${nova.paciente?.nome}!`);
      carregarDados();
      setObservacoes("");
      setDataPrevistaAlta("");
    } catch (err) {
      setMensagemErro(err.message || "Erro ao registrar internação.");
    }
  }

  async function handleAlta(id) {
    const obsAlta = window.prompt("Observações de alta do paciente:");
    if (obsAlta === null) return; // cancelou o prompt

    setMensagemSucesso("");
    setMensagemErro("");

    try {
      await api.registrarAlta(id, obsAlta);
      setMensagemSucesso("Alta hospitalar registrada com sucesso! O leito foi liberado.");
      carregarDados();
    } catch (err) {
      setMensagemErro(err.message || "Erro ao registrar alta hospitalar.");
    }
  }

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Internações Hospitalares</h1>
          <p>Admissão de pacientes, vinculação de leitos e registro de alta médica</p>
        </div>
      </div>

      {mensagemSucesso && <div className="alertaSucesso">{mensagemSucesso}</div>}
      {mensagemErro && <div className="alertaErro">{mensagemErro}</div>}

      <div className="formulario">
        <h2>Registrar Nova Internação</h2>

        <form onSubmit={handleSubmit}>
          <div className="gridFormulario">
            <div>
              <label>Paciente *</label>
              <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} required>
                <option value="">Selecione o paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (CPF: {p.cpf})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Médico Responsável *</label>
              <select value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)} required>
                <option value="">Selecione o profissional</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - {p.categoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Quarto / Leito Disponível *</label>
              <select value={quartoId} onChange={(e) => setQuartoId(e.target.value)} required>
                <option value="">Selecione um quarto disponível</option>
                {quartosDisponiveis.map((q) => (
                  <option key={q.id} value={q.id}>
                    Quarto {q.numeroIdentificacao} ({q.tipoQuarto} - Andar {q.andar} | {q.quantidadeOcupantes}/{q.capacidadeMaxima} leitos)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Data/Hora de Entrada *</label>
              <input
                type="datetime-local"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Previsão de Alta</label>
              <input
                type="datetime-local"
                value={dataPrevistaAlta}
                onChange={(e) => setDataPrevistaAlta(e.target.value)}
              />
            </div>
          </div>

          <div className="campoObservacao">
            <label>Observações Clínicas da Admissão</label>
            <textarea
              rows="3"
              placeholder="Indicações da internação, quadro clínico..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <button type="submit" className="botaoPrincipal">
            Confirmar Internação
          </button>
        </form>
      </div>

      <div className="painel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>Internações ({internacoes.length})</h2>
          <div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", textTransform: "none" }}>
              <input
                type="checkbox"
                checked={filtroAtivas}
                onChange={(e) => setFiltroAtivas(e.target.checked)}
              />
              Exibir apenas internações ativas
            </label>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico Responsável</th>
              <th>Quarto</th>
              <th>Entrada</th>
              <th>Previsão de Alta</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {internacoes.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                  Nenhuma internação encontrada.
                </td>
              </tr>
            ) : (
              internacoes.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.paciente?.nome}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>CPF: {i.paciente?.cpf}</div>
                  </td>
                  <td>{i.profissionalResponsavel?.nome}</td>
                  <td>
                    <span className="badge" style={{ background: "#f1f5f9", color: "#334155" }}>
                      Quarto {i.quarto?.numeroIdentificacao} ({i.quarto?.tipoQuarto})
                    </span>
                  </td>
                  <td>{new Date(i.dataEntrada).toLocaleString("pt-BR")}</td>
                  <td>
                    {i.dataPrevistaAlta
                      ? new Date(i.dataPrevistaAlta).toLocaleString("pt-BR")
                      : "A definir"}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: i.ativa ? "#d1fae5" : "#f1f5f9",
                        color: i.ativa ? "#065f46" : "#64748b"
                      }}
                    >
                      {i.ativa ? "Internado" : "Alta Realizada"}
                    </span>
                  </td>
                  <td>
                    {i.ativa && (
                      <button className="btnAcao btnConcluir" onClick={() => handleAlta(i.id)}>
                        Dar Alta
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Internacoes;
