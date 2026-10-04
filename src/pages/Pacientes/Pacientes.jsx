import "../../styles/forms.css";

function Pacientes() {
  return (
    <div>
      <div className="tituloPagina">
        <h1>Pacientes</h1>
        <p>Cadastro e gerenciamento de pacientes</p>
      </div>

      <div className="formulario">

        <h2>Cadastrar Paciente</h2>

        <div className="gridFormulario">

          <div>
            <label>Nome completo</label>
            <input type="text" placeholder="Digite o nome" />
          </div>

          <div>
            <label>CPF</label>
            <input type="text" placeholder="000.000.000-00" />
          </div>

          <div>
            <label>Data de nascimento</label>
            <input type="date" />
          </div>

          <div>
            <label>Telefone</label>
            <input type="text" placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label>E-mail</label>
            <input type="email" placeholder="email@exemplo.com" />
          </div>

          <div>
            <label>Endereço</label>
            <input type="text" placeholder="Digite o endereço" />
          </div>

        </div>

        <button className="botaoPrincipal">
          Cadastrar paciente
        </button>

      </div>
    </div>
  );
}

export default Pacientes;