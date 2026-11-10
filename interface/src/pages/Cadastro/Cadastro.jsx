import { Link, useNavigate } from "react-router-dom";
import "../../styles/forms.css";
import "../Login/Login.css";

function Cadastro() {
  const navigate = useNavigate();

  const handleCadastro = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-box auth-box--register formulario">
        <div className="auth-header">
          <div className="auth-logoIcone" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>
          <h2>Hospital Pro</h2>
          <p>Cadastre seus dados para acessar o sistema de gestão.</p>
        </div>

        <form onSubmit={handleCadastro} className="auth-form">
          <div className="campo-unico">
            <label htmlFor="register-name">Nome completo</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="campo-unico">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="campo-unico">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma senha"
              required
            />
          </div>

          <button type="submit" className="botaoPrincipal auth-btn">
            Cadastrar
          </button>
        </form>

        <p className="auth-footer">
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
