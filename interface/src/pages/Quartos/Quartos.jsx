import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "../../styles/forms.css";
import "./Quartos.css";

function Quartos() {
  const [quartos, setQuartos] = useState([]);
  const [numeroIdentificacao, setNumeroIdentificacao] = useState("");
  const [andar, setAndar] = useState("1");
  const [capacidadeMaxima, setCapacidadeMaxima] = useState("2");
  const [tipoQuarto, setTipoQuarto] = useState("ENFERMARIA");

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    carregarQuartos();
  }, []);

  async function carregarQuartos() {
    try {
      const dados = await api.getQuartos();
      setQuartos(dados || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    const payload = {
      numeroIdentificacao: Number(numeroIdentificacao),
      andar: Number(andar),
      capacidadeMaxima: Number(capacidadeMaxima),
      tipoQuarto
    };

    try {
      const novo = await api.createQuarto(payload);
      setMensagemSucesso(`Quarto ${novo.numeroIdentificacao} cadastrado com sucesso!`);
      setQuartos([...quartos, novo]);
      setNumeroIdentificacao("");
    } catch (err) {
      setMensagemErro(err.message || "Erro ao cadastrar quarto.");
    }
  }

  async function toggleManutencao(id, situacaoAtual) {
    setMensagemSucesso("");
    setMensagemErro("");
    const novaSituacao = situacaoAtual === "MANUTENCAO" ? "DISPONIVEL" : "MANUTENCAO";
    try {
      await api.patchQuartoSituacao(id, novaSituacao);
      setMensagemSucesso(`Situação do quarto atualizada para ${novaSituacao}.`);
      carregarQuartos();
    } catch (err) {
      setMensagemErro(err.message || "Não foi possível alterar a situação do quarto.");
    }
  }

  const quartosFiltrados = filtroTipo
    ? quartos.filter((q) => q.tipoQuarto === filtroTipo)
    : quartos;

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Gestão de Leitos & Quartos</h1>
          <p>Monitoramento de ocupação, enfermarias, quartos individuais e UTIs</p>
        </div>
      </div>

      {mensagemSucesso && <div className="alertaSucesso">{mensagemSucesso}</div>}
      {mensagemErro && <div className="alertaErro">{mensagemErro}</div>}

      <div className="formulario">
        <h2>Adicionar Novo Quarto / Leito</h2>
        <form onSubmit={handleSubmit}>
          <div className="gridFormulario">
            <div>
              <label>Número do Quarto *</label>
              <input
                type="number"
                placeholder="Ex: 105"
                value={numeroIdentificacao}
                onChange={(e) => setNumeroIdentificacao(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Andar *</label>
              <input
                type="number"
                value={andar}
                onChange={(e) => setAndar(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Tipo de Quarto *</label>
              <select
                value={tipoQuarto}
                onChange={(e) => {
                  const t = e.target.value;
                  setTipoQuarto(t);
                  if (t === "INDIVIDUAL" || t === "UTI") {
                    setCapacidadeMaxima("1");
                  }
                }}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="ENFERMARIA">Enfermaria</option>
                <option value="UTI">UTI (Unidade de Terapia Intensiva)</option>
              </select>
            </div>

            <div>
              <label>Capacidade Máxima de Leitos *</label>
              <input
                type="number"
                min="1"
                max={tipoQuarto === "INDIVIDUAL" ? "1" : "10"}
                value={capacidadeMaxima}
                onChange={(e) => setCapacidadeMaxima(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="botaoPrincipal">
            Salvar Quarto
          </button>
        </form>
      </div>

      <div className="painel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Quartos Cadastrados ({quartosFiltrados.length})</h2>
          <select
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="ENFERMARIA">Enfermaria</option>
            <option value="UTI">UTI</option>
          </select>
        </div>

        <div className="listaQuartos">
          {quartosFiltrados.map((q) => {
            const ocupacaoPct = (q.quantidadeOcupantes / q.capacidadeMaxima) * 100;
            const corBarra =
              q.situacao === "MANUTENCAO"
                ? "#94a3b8"
                : ocupacaoPct >= 100
                ? "#dc2626"
                : ocupacaoPct > 0
                ? "#d97706"
                : "#059669";

            return (
              <div key={q.id} className="quartoCard">
                <div className="quartoHeader">
                  <h3>Quarto {q.numeroIdentificacao}</h3>
                  <span className="tipoTag">{q.tipoQuarto}</span>
                </div>

                <div className="quartoDetalhes">
                  <span>📍 {q.andar}º Andar</span>
                  <span>
                    👥 Ocupação: <strong>{q.quantidadeOcupantes}</strong> / {q.capacidadeMaxima} leitos
                  </span>
                </div>

                <div className="barraOcupacao">
                  <div
                    className="barraPreenchida"
                    style={{
                      width: `${Math.min(ocupacaoPct, 100)}%`,
                      backgroundColor: corBarra
                    }}
                  />
                </div>

                <div className="quartoFooter">
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        q.situacao === "DISPONIVEL"
                          ? "#ecfdf5"
                          : q.situacao === "OCUPADO"
                          ? "#fee2e2"
                          : "#f1f5f9",
                      color:
                        q.situacao === "DISPONIVEL"
                          ? "#059669"
                          : q.situacao === "OCUPADO"
                          ? "#dc2626"
                          : "#64748b"
                    }}
                  >
                    {q.situacao}
                  </span>

                  <button
                    className="btnAcao"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => toggleManutencao(q.id, q.situacao)}
                  >
                    {q.situacao === "MANUTENCAO" ? "Liberar Quarto" : "Manutenção"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Quartos;
