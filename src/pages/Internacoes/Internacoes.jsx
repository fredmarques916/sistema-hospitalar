import "../../styles/forms.css";

function Internacoes() {
  return (
    <div>

      <div className="tituloPagina">
        <h1>Internações</h1>
        <p>Controle de internações hospitalares</p>
      </div>

      <div className="formulario">

        <h2>Nova Internação</h2>

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
            <label>Profissional responsável</label>
            <select>
              <option>Selecione o profissional</option>
              <option>Dr. Carlos Mendes</option>
              <option>Dra. Ana Costa</option>
            </select>
          </div>

          <div>
            <label>Quarto</label>
            <select>
              <option>Selecione um quarto</option>
              <option>101</option>
              <option>102</option>
              <option>203</option>
            </select>
          </div>

          <div>
            <label>Data de entrada</label>
            <input type="date" />
          </div>

          <div>
            <label>Data prevista de alta</label>
            <input type="date" />
          </div>

          <div>
            <label>Data efetiva de alta</label>
            <input type="date" />
          </div>

        </div>

        <div className="campoObservacao">
          <label>Observações</label>
          <textarea
            rows="4"
            placeholder="Observações da internação"
          />
        </div>

        <button className="botaoPrincipal">
          Registrar internação
        </button>

      </div>
    </div>
  );
}

export default Internacoes;