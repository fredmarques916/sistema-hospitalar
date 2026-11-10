import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "../../styles/forms.css";

function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [nome, setNome] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [categoria, setCategoria] = useState("CLINICO_GERAL");
  const [especialidade, setEspecialidade] = useState("");
  const [atuacaoCirurgica, setAtuacaoCirurgica] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    carregarProfissionais();
  }, [filtroCategoria, filtroEspecialidade]);

  async function carregarProfissionais() {
    try {
      let params = "";
      if (filtroCategoria) params += `categoria=${filtroCategoria}&`;
      if (filtroEspecialidade) params += `especialidade=${encodeURIComponent(filtroEspecialidade)}`;
      const dados = await api.getProfissionais(params);
      setProfissionais(dados || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    const payload = {
      nome,
      registroProfissional,
      categoria,
      especialidade: categoria === "ESPECIALISTA" ? especialidade : null,
      atuacaoCirurgica: categoria === "CIRURGIAO" ? atuacaoCirurgica : null,
      telefone,
      email
    };

    try {
      const novo = await api.createProfissional(payload);
      setMensagemSucesso("Profissional cadastrado com sucesso!");
      setProfissionais([novo, ...profissionais]);
      setNome("");
      setRegistroProfissional("");
      setEspecialidade("");
      setAtuacaoCirurgica("");
      setTelefone("");
      setEmail("");
    } catch (err) {
      setMensagemErro(err.message || "Erro ao cadastrar profissional.");
    }
  }

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Corpo Clínico & Profissionais de Saúde</h1>
          <p>Gestão de médicos clínicos gerais, especialistas e cirurgiões</p>
        </div>
      </div>

      {mensagemSucesso && <div className="alertaSucesso">{mensagemSucesso}</div>}
      {mensagemErro && <div className="alertaErro">{mensagemErro}</div>}

      <div className="formulario">
        <h2>Cadastrar Profissional de Saúde</h2>

        <form onSubmit={handleSubmit}>
          <div className="gridFormulario">
            <div>
              <label>Nome Completo *</label>
              <input
                placeholder="Ex: Dra. Camila Nogueira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Registro Profissional (CRM/COREN) *</label>
              <input
                placeholder="Ex: CRM/MG 45890"
                value={registroProfissional}
                onChange={(e) => setRegistroProfissional(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Categoria Profissional *</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="CLINICO_GERAL">Médico Clínico Geral</option>
                <option value="ESPECIALISTA">Médico Especialista</option>
                <option value="CIRURGIAO">Cirurgião</option>
              </select>
            </div>

            {categoria === "ESPECIALISTA" && (
              <div>
                <label>Área de Especialidade *</label>
                <input
                  placeholder="Ex: Cardiologia, Ortopedia, Neurologia"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  required
                />
              </div>
            )}

            {categoria === "CIRURGIAO" && (
              <div>
                <label>Atuação Cirúrgica Habilitada *</label>
                <input
                  placeholder="Ex: Cirurgia Geral e Laparoscopia"
                  value={atuacaoCirurgica}
                  onChange={(e) => setAtuacaoCirurgica(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label>Telefone</label>
              <input
                placeholder="(31) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div>
              <label>E-mail Institucional</label>
              <input
                type="email"
                placeholder="medico@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="botaoPrincipal">
            Salvar Profissional
          </button>
        </form>
      </div>

      <div className="painel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>Profissionais Cadastrados ({profissionais.length})</h2>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              style={{ padding: "6px 12px", fontSize: "0.85rem" }}
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              <option value="CLINICO_GERAL">Clínico Geral</option>
              <option value="ESPECIALISTA">Especialista</option>
              <option value="CIRURGIAO">Cirurgião</option>
            </select>

            <input
              style={{ padding: "6px 12px", fontSize: "0.85rem", width: "180px" }}
              placeholder="Filtrar especialidade..."
              value={filtroEspecialidade}
              onChange={(e) => setFiltroEspecialidade(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Registro</th>
              <th>Categoria</th>
              <th>Especialidade / Atuação</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nome}</strong></td>
                <td><code>{p.registroProfissional}</code></td>
                <td>
                  <span className="badge" style={{
                    background: p.categoria === "CIRURGIAO" ? "#fee2e2" : p.categoria === "ESPECIALISTA" ? "#e0f2fe" : "#f1f5f9",
                    color: p.categoria === "CIRURGIAO" ? "#b91c1c" : p.categoria === "ESPECIALISTA" ? "#0369a1" : "#334155"
                  }}>
                    {p.categoria === "CLINICO_GERAL" ? "Clínico Geral" : p.categoria === "ESPECIALISTA" ? "Especialista" : "Cirurgião"}
                  </span>
                </td>
                <td>
                  {p.especialidade && <strong>{p.especialidade}</strong>}
                  {p.atuacaoCirurgica && <span>{p.atuacaoCirurgica}</span>}
                  {!p.especialidade && !p.atuacaoCirurgica && <span style={{ color: "var(--text-muted)" }}>Consultas gerais</span>}
                </td>
                <td>
                  <div>{p.telefone || "Não informado"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.email}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Profissionais;
