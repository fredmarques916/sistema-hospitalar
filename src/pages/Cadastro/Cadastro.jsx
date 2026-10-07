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
      <div className="auth-box formulario" style={{ maxWidth: "450px" }}>
        <div className="auth-header">
          <div className="auth-logoIcone">+</div>
          <h2>Hospital</h2>
          <p>Crie sua conta no sistema</p>
        </div>

        <form onSubmit={handleCadastro} className="auth-form">
          <div className="campo-unico">
            <label>Nome completo</label>
            <input type="text" placeholder="Digite seu nome" required />
          </div>

          <div className="campo-unico">
            <label>E-mail</label>
            <input type="email" placeholder="email@exemplo.com" required />
          </div>

          <div className="campo-unico">
            <label>Senha</label>
            <input type="password" placeholder="Crie uma senha" required />
          </div>

          <button type="submit" className="botaoPrincipal auth-btn">
            Cadastrar
          </button>
        </form>

        <p className="auth-footer">
          Já possui uma conta? <Link to="/login">Faça Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
