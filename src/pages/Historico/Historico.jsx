import "./Historico.css";

function Historico() {
  return (
    <div>

      <div className="tituloPagina">
        <h1>Histórico Médico</h1>
        <p>Consulte o histórico de atendimentos do paciente</p>
      </div>

      <div className="buscaHistorico">

        <label>Paciente</label>

        <select>
          <option>Selecione um paciente</option>
          <option>Maria Silva</option>
          <option>João Santos</option>
        </select>

        <button className="botaoPrincipal">
          Consultar histórico
        </button>

      </div>

      <div className="historicoPaciente">

        <h2>Maria Silva</h2>

        <p className="dadosPaciente">
          CPF: 000.000.000-00
        </p>

        <div className="eventoHistorico">
          <span>Consulta</span>
          <h3>Cardiologia</h3>
          <p>15/09/2026 - Dr. Carlos Mendes</p>
          <p>Consulta de acompanhamento.</p>
        </div>

        <div className="eventoHistorico">
          <span>Internação</span>
          <h3>Internação Hospitalar</h3>
          <p>02/08/2026 até 05/08/2026</p>
          <p>Quarto 203</p>
        </div>

      </div>

    </div>
  );
}

export default Historico;