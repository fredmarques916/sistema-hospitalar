import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "../../styles/forms.css";
import "../Login/Login.css";

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("Operador Clínico");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (senha.length < 6) {
      setErro("A senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const usuario = await api.cadastro(nome, email, senha, cargo);
      api.salvarSessao(usuario);
      navigate("/dashboard");
    } catch (err) {
      setErro(err.message || "Não foi possível concluir o cadastro.");
    } finally {
      setCarregando(false);
    }
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

        {erro && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "0.85rem",
              lineHeight: 1.4
            }}
          >
            <strong>Erro no cadastro:</strong> {erro}
          </div>
        )}

        <form onSubmit={handleCadastro} className="auth-form">
          <div className="campo-unico">
            <label htmlFor="register-name">Nome completo</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <div className="campo-unico">
            <label htmlFor="register-email">E-mail corporativo</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <div className="campo-unico">
            <label htmlFor="register-cargo">Função / Cargo Hospitalar</label>
            <select
              id="register-cargo"
              style={{
                width: "100%",
                minHeight: "42px",
                padding: "8px 12px",
                border: "1px solid var(--ds-slate-300, #cbd5e1)",
                borderRadius: "var(--ds-radius-md, 8px)",
                background: "#ffffff",
                color: "var(--ds-slate-900, #0f172a)",
                fontSize: "14px",
                fontFamily: "inherit"
              }}
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              disabled={carregando}
            >
              <option value="Médico(a) Clínico(a)">Médico(a) Clínico(a)</option>
              <option value="Médico(a) Especialista">Médico(a) Especialista</option>
              <option value="Cirurgião(ã)">Cirurgião(ã)</option>
              <option value="Enfermeiro(a) Chefe">Enfermeiro(a) Chefe</option>
              <option value="Recepcionista / Triagem">Recepcionista / Triagem</option>
              <option value="Administrador do Sistema">Administrador do Sistema</option>
            </select>
          </div>

          <div className="campo-unico">
            <label htmlFor="register-password">Senha de acesso (mínimo 6 caracteres)</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            className="botaoPrincipal auth-btn"
            disabled={carregando}
          >
            {carregando ? "Cadastrando..." : "Concluir Cadastro & Entrar"}
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
