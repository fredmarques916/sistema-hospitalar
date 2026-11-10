import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "../../styles/forms.css";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Se o usuário já tiver uma sessão válida, redireciona ao painel
    const usuarioLogado = api.obterSessao();
    if (usuarioLogado) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const usuario = await api.login(email, senha);
      api.salvarSessao(usuario);
      navigate("/dashboard");
    } catch (err) {
      setErro(err.message || "E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  };

  const preencherAcessoRapido = (emailExemplo, senhaExemplo) => {
    setEmail(emailExemplo);
    setSenha(senhaExemplo);
    setErro("");
  };

  return (
    <div className="auth-container">
      <div className="auth-box formulario">
        <div className="auth-header">
          <div className="auth-logoIcone" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>
          <h2>Hospital Pro</h2>
          <p>Acesse o sistema de gestão hospitalar integrada.</p>
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
            <strong>Falha na autenticação:</strong> {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="campo-unico">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
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
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            className="botaoPrincipal auth-btn"
            disabled={carregando}
          >
            {carregando ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px dashed #cbd5e1",
            fontSize: "0.8rem",
            color: "#64748b"
          }}
        >
          <div style={{ fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
            Contas de demonstração cadastradas:
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "0.75rem",
                color: "#1d68bd",
                cursor: "pointer",
                fontWeight: 600
              }}
              onClick={() => preencherAcessoRapido("admin@hospital.com", "admin123")}
            >
              Admin
            </button>
            <button
              type="button"
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "0.75rem",
                color: "#1d68bd",
                cursor: "pointer",
                fontWeight: 600
              }}
              onClick={() => preencherAcessoRapido("medico@hospital.com", "medico123")}
            >
              Médico Clínico
            </button>
          </div>
        </div>

        <p className="auth-footer">
          Ainda não possui uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
