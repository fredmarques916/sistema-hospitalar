import { useState, useEffect } from "react";
import "./Header.css";

function Header() {
  const [dataAtual, setDataAtual] = useState("");

  useEffect(() => {
    const hoje = new Date();
    const formatada = hoje.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    // Capitaliza primeira letra
    setDataAtual(formatada.charAt(0).toUpperCase() + formatada.slice(1));
  }, []);

  return (
    <header className="header">
      <div className="header-context">
        <span className="plantao-tag">Turno Clínico Diurno</span>
        <span className="data-hoje">{dataAtual}</span>
      </div>

      <div className="header-actions">
        <div className="usuario">
          <div className="avatar">MED</div>
          <div className="usuario-info">
            <strong>Equipe Médica & Triagem</strong>
            <span>Operador Autorizado</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
