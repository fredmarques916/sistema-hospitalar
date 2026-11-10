import "./Quartos.css";

function Quartos() {
  return (
    <div>

      <div className="tituloPagina">
        <h1>Quartos</h1>
        <p>Disponibilidade dos quartos hospitalares</p>
      </div>

      <div className="listaQuartos">

        <div className="quarto disponivel">
          <h2>Quarto 101</h2>
          <p>1º andar</p>
          <p>Capacidade: 2 pacientes</p>
          <span>Disponível</span>
        </div>

        <div className="quarto ocupado">
          <h2>Quarto 102</h2>
          <p>1º andar</p>
          <p>Capacidade: 1 paciente</p>
          <span>Ocupado</span>
        </div>

        <div className="quarto disponivel">
          <h2>Quarto 203</h2>
          <p>2º andar</p>
          <p>Capacidade: 3 pacientes</p>
          <span>Disponível</span>
        </div>

        <div className="quarto ocupado">
          <h2>Quarto 204</h2>
          <p>2º andar</p>
          <p>Capacidade: 2 pacientes</p>
          <span>Ocupado</span>
        </div>

      </div>
    </div>
  );
}

export default Quartos;