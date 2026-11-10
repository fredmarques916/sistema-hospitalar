import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "./AuthNavbar.css";

function AuthNavbar({ onLogout }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    setUsuario(api.obterSessao());
  }, []);

  const handleSair = () => {
    api.encerrarSessao();
    setUsuario(null);
    if (onLogout) {
      onLogout();
    } else {
      navigate("/login");
    }
  };

  const isAdmin = usuario?.cargo === "Administrador";
  const isMedico = usuario?.cargo === "Médico Clínico";

  return (
    <nav className="auth-nav" aria-label="Navegação da Autenticação">
      <Link to="/" className="auth-nav-brand">
        <span className="auth-nav-brand-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6v12M6 12h12" />
          </svg>
        </span>
        <div className="auth-nav-brand-text">
          <strong>Hospital Pro</strong>
          <span>Centro Médico Universitário</span>
        </div>
      </Link>

      <div className="auth-nav-menu">
        <NavLink to="/" className={({ isActive }) => `auth-nav-link ${isActive ? "active" : ""}`}>
          Página Inicial
        </NavLink>

        {usuario ? (
          <>
            <Link
              to="/dashboard"
              className="auth-nav-link highlight"
              title="Acessar o painel operacional de acordo com seu perfil"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span>{isAdmin ? "Painel Geral (Admin)" : isMedico ? "Meu Painel Clínico" : "Ir para o Painel"}</span>
            </Link>

            <div className="auth-user-chip">
              <span>{usuario.nome}</span>
              <span className={`auth-user-role-badge ${isAdmin ? "admin" : isMedico ? "medico" : ""}`}>
                {isAdmin ? "Admin" : isMedico ? "Médico" : usuario.cargo}
              </span>
            </div>

            <button
              type="button"
              className="auth-nav-btn-sair"
              onClick={handleSair}
              title="Encerrar sessão ativa"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sair</span>
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => `auth-nav-link ${isActive ? "active" : ""}`}
            >
              Entrar
            </NavLink>

            <NavLink
              to="/cadastro"
              className={({ isActive }) => `auth-nav-link ${isActive ? "active" : "highlight"}`}
            >
              Criar Conta
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default AuthNavbar;
