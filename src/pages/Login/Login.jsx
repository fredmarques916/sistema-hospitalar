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
          <div className="auth-logoIcone">+</div>
          <h2>Hospital</h2>
          <p>Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="campo-unico">
            <label>E-mail</label>
            <input type="email" placeholder="email@exemplo.com" required />
          </div>

          <div className="campo-unico">
            <label>Senha</label>
            <input type="password" placeholder="Sua senha" required />
          </div>

          <button type="submit" className="botaoPrincipal auth-btn">
            Entrar
          </button>
        </form>

        <p className="auth-footer">
          Não possui uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
