import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import AuthNavbar from "../../components/AuthNavbar/AuthNavbar";
import "../../styles/forms.css";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const usuario = api.obterSessao();
    if (usuario) {
      setUsuarioLogado(usuario);
    }
  }, []);

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

  const handleLogout = () => {
    api.encerrarSessao();
    setUsuarioLogado(null);
    setEmail("");
    setSenha("");
    setErro("");
  };

  const isAdmin = usuarioLogado?.cargo === "Administrador";
  const isMedico = usuarioLogado?.cargo === "Médico Clínico";

  return (
    <div className="auth-page">
      <AuthNavbar onLogout={handleLogout} />

      <main className="auth-container">
        {usuarioLogado ? (
          <div className="auth-box formulario">
            <div className="auth-header">
              <div className="auth-logoIcone" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </div>
              <h2>Sessão Ativa</h2>
              <p>Você já está autenticado no sistema hospitalar.</p>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px"
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                Usuário Conectado
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                {usuarioLogado.nome}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#1d68bd", fontWeight: 600, marginTop: "2px" }}>
                {usuarioLogado.cargo} &bull; <span style={{ color: "#64748b" }}>{usuarioLogado.email}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                to="/dashboard"
                className="botaoPrincipal auth-btn"
                style={{
                  textDecoration: "none",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <span>
                  {isAdmin
                    ? "Acessar Painel Geral (Administração)"
                    : isMedico
                    ? "Acessar Meu Painel Clínico (Plantão)"
                    : "Acessar Painel do Sistema"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="auth-btn"
                style={{
                  background: "#ffffff",
                  color: "#475569",
                  borderColor: "#cbd5e1",
                  marginTop: 0
                }}
              >
                Encerrar Sessão e Entrar com Outra Conta
              </button>
            </div>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem" }}>
              <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>
                &larr; Voltar para a Página Inicial
              </Link>
            </div>
          </div>
        ) : (
          <div className="auth-box formulario">
            <div className="auth-header">
              <div className="auth-logoIcone" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </div>
              <h2>Acesso ao Sistema</h2>
              <p>Informe suas credenciais para autenticar seu perfil.</p>
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
                <label htmlFor="login-email">E-mail corporativo</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={carregando}
                />
              </div>

              <div className="campo-unico">
                <label htmlFor="login-password">Senha de acesso</label>
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

            <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ margin: 0 }}>
                Ainda não possui uma conta? <Link to="/cadastro">Criar nova conta</Link>
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>
                <Link to="/" style={{ color: "#64748b" }}>&larr; Voltar para a Página Inicial</Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Login;
