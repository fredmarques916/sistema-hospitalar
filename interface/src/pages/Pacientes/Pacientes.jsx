import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "../../styles/forms.css";

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");

  const [busca, setBusca] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    try {
      const dados = await api.getPacientes();
      setPacientes(dados || []);
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
      cpf,
      dataNascimento,
      telefone,
      email,
      endereco
    };

    try {
      const novo = await api.createPaciente(payload);
      setMensagemSucesso(`Paciente ${novo.nome} cadastrado com sucesso!`);
      setPacientes([novo, ...pacientes]);
      setNome("");
      setCpf("");
      setDataNascimento("");
      setTelefone("");
      setEmail("");
      setEndereco("");
    } catch (err) {
      setMensagemErro(err.message || "Erro ao cadastrar paciente.");
    }
  }

  const pacientesFiltrados = busca
    ? pacientes.filter(
        (p) =>
          p.nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.cpf.includes(busca)
      )
    : pacientes;

  return (
    <div>
      <div className="tituloPagina">
        <div>
          <h1>Prontuário & Cadastro de Pacientes</h1>
          <p>Registro cadastral unificado de pacientes para atendimento e internação</p>
        </div>
      </div>

      {mensagemSucesso && <div className="alertaSucesso">{mensagemSucesso}</div>}
      {mensagemErro && <div className="alertaErro">{mensagemErro}</div>}

      <div className="formulario">
        <h2>Novo Paciente</h2>

        <form onSubmit={handleSubmit}>
          <div className="gridFormulario">
            <div>
              <label>Nome Completo *</label>
              <input
                type="text"
                placeholder="Ex: Maria da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div>
              <label>CPF *</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Data de Nascimento *</label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Telefone para Contato</label>
              <input
                type="text"
                placeholder="(31) 98765-4321"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div>
              <label>E-mail</label>
              <input
                type="email"
                placeholder="paciente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label>Endereço Residencial</label>
              <input
                type="text"
                placeholder="Rua, número, bairro e cidade"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="botaoPrincipal">
            Salvar Paciente
          </button>
        </form>
      </div>

      <div className="painel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>Pacientes Cadastrados ({pacientesFiltrados.length})</h2>
          <input
            style={{ padding: "6px 14px", fontSize: "0.85rem", width: "240px" }}
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Nascimento</th>
              <th>Contato</th>
              <th>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                  Nenhum paciente cadastrado.
                </td>
              </tr>
            ) : (
              pacientesFiltrados.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.nome}</strong></td>
                  <td><code>{p.cpf}</code></td>
                  <td>{p.dataNascimento}</td>
                  <td>
                    <div>{p.telefone || "Não informado"}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.email}</div>
                  </td>
                  <td>{p.endereco || "Não informado"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Pacientes;
