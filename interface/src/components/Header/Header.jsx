import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [dataAtual, setDataAtual] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const hoje = new Date();
    const formatada = hoje.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    setDataAtual(formatada.charAt(0).toUpperCase() + formatada.slice(1));
    setUsuario(api.obterSessao());
  }, []);

  const handleLogout = () => {
    api.encerrarSessao();
    navigate("/login");
  };

  const getIniciais = (nome) => {
    if (!nome) return "OP";
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  };

  const nomeExibicao = usuario?.nome || "Equipe Médica & Triagem";
  const cargoExibicao = usuario?.cargo || "Operador Autorizado";
  const iniciais = getIniciais(nomeExibicao);
  const isAdmin = usuario?.cargo === "Administrador";
  const isMedico = usuario?.cargo === "Médico Clínico";
  const tagClass = isAdmin ? "plantao-tag tag-admin" : isMedico ? "plantao-tag tag-medico" : "plantao-tag";
  const tagTexto = isAdmin ? "🛡️ Gestão & Governança" : isMedico ? "🩺 Plantão Clínico Assistencial" : "Turno Diurno";

  return (
    <header className="header">
      <div className="header-context">
        <span className={tagClass}>{tagTexto}</span>
        <span className="data-hoje">{dataAtual}</span>
      </div>

      <div className="header-actions">
        <div className="usuario">
          <div className="avatar" title={usuario?.email || "Usuário do Sistema"}>
            {iniciais}
          </div>
          <div className="usuario-info">
            <strong>{nomeExibicao}</strong>
            <span>{cargoExibicao}</span>
          </div>
        </div>

        <button
          className="btn-logout"
          onClick={handleLogout}
          title="Encerrar sessão e sair do sistema"
          aria-label="Encerrar sessão"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
