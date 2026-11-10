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
          <div className="auth-logoIcone" aria-hidden="true">+</div>
          <h2>Hospital</h2>
          <p>Cadastre seus dados para acessar o sistema.</p>
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
