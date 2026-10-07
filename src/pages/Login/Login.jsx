import { Link, useNavigate } from "react-router-dom";
import "../../styles/forms.css";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-box formulario">
        <div className="auth-header">
          <div className="auth-logoIcone" aria-hidden="true">+</div>
          <h2>Hospital</h2>
          <p>Acesse o sistema de gestão hospitalar.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="campo-unico">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="campo-unico">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button type="submit" className="botaoPrincipal auth-btn">
            Entrar
          </button>
        </form>

        <p className="auth-footer">
          Ainda não possui uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
