import "../../styles/forms.css";

function Consultas() {
  return (
    <div>

      <div className="tituloPagina">
        <h1>Consultas</h1>
        <p>Agendamento e controle de consultas</p>
      </div>

      <div className="formulario">

        <h2>Agendar Consulta</h2>

        <div className="gridFormulario">

          <div>
            <label>Paciente</label>
            <select>
              <option>Selecione o paciente</option>
              <option>Maria Silva</option>
              <option>João Santos</option>
            </select>
          </div>

          <div>
            <label>Profissional</label>
            <select>
              <option>Selecione o profissional</option>
              <option>Dr. Carlos Mendes</option>
              <option>Dra. Ana Costa</option>
            </select>
          </div>

          <div>
            <label>Data</label>
            <input type="date" />
          </div>

          <div>
            <label>Horário</label>
            <input type="time" />
          </div>

          <div>
            <label>Motivo da consulta</label>
            <input placeholder="Informe o motivo" />
          </div>

        </div>

        <div className="campoObservacao">
          <label>Observações médicas</label>
          <textarea
            rows="4"
            placeholder="Observações..."
          />
        </div>

        <button className="botaoPrincipal">
          Agendar consulta
        </button>

      </div>
    </div>
  );
}

export default Consultas;