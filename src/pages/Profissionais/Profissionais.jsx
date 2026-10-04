import "../../styles/forms.css";

function Profissionais() {
  return (
    <div>
      <div className="tituloPagina">
        <h1>Profissionais da Saúde</h1>
        <p>Cadastro de profissionais</p>
      </div>

      <div className="formulario">

        <h2>Cadastrar Profissional</h2>

        <div className="gridFormulario">

          <div>
            <label>Nome</label>
            <input placeholder="Nome completo" />
          </div>

          <div>
            <label>Registro profissional</label>
            <input placeholder="CRM / COREN" />
          </div>

          <div>
            <label>Especialidade</label>
            <input placeholder="Especialidade" />
          </div>

          <div>
            <label>Telefone</label>
            <input placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label>E-mail</label>
            <input type="email" placeholder="email@hospital.com" />
          </div>

        </div>

        <button className="botaoPrincipal">
          Cadastrar profissional
        </button>

      </div>
    </div>
  );
}

export default Profissionais;