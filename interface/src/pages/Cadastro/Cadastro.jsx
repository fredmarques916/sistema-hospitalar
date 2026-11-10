import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import AuthNavbar from "../../components/AuthNavbar/AuthNavbar";
import "../../styles/forms.css";
import "../Login/Login.css";

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("Médico Clínico");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const usuario = api.obterSessao();
    if (usuario) {
      setUsuarioLogado(usuario);
    }
  }, []);

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
      // Se quem cadastrou for um admin criando outra conta para terceiros, ele pode optar por continuar ou logar como a nova conta
      if (!usuarioLogado || usuarioLogado.cargo !== "Administrador") {
        api.salvarSessao(usuario);
      }
      navigate("/dashboard");
    } catch (err) {
      setErro(err.message || "Não foi possível concluir o cadastro.");
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    api.encerrarSessao();
    setUsuarioLogado(null);
    setErro("");
  };

  const isAdmin = usuarioLogado?.cargo === "Administrador";
  const isMedico = usuarioLogado?.cargo === "Médico Clínico";

  return (
    <div className="auth-page">
      <AuthNavbar onLogout={handleLogout} />

      <main className="auth-container">
        {/* Se for usuário comum já logado (não-admin), exibe opção de ir ao painel ou deslogar para criar nova conta */}
        {usuarioLogado && !isAdmin ? (
          <div className="auth-box auth-box--register formulario">
            <div className="auth-header">
              <div className="auth-logoIcone" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </div>
              <h2>Sessão Ativa Detectada</h2>
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
                Conta Conectada
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
                <span>{isMedico ? "Ir para Meu Painel Clínico" : "Ir para o Painel"}</span>
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
                Encerrar Sessão para Cadastrar Nova Conta
              </button>
            </div>

            <div className="auth-footer">
              <Link to="/" style={{ color: "#64748b" }}>&larr; Voltar para a Página Inicial</Link>
            </div>
          </div>
        ) : (
          <div className="auth-box auth-box--register formulario">
            <div className="auth-header">
              <div className="auth-logoIcone" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </div>
              <h2>
                {isAdmin ? "Cadastro de Novo Operador" : "Criar Nova Conta"}
              </h2>
              <p>
                {isAdmin
                  ? "Como Administrador, credencie um novo membro para a equipe hospitalar."
                  : "Cadastre seus dados para obter credenciais de acesso ao sistema."}
              </p>
            </div>

            {isAdmin && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: "18px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  fontSize: "0.825rem",
                  lineHeight: 1.4
                }}
              >
                🛡️ <strong>Modo Gestão Ativo:</strong> Você está provisionando um operador com privilégios institucionais.
              </div>
            )}

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
                <label htmlFor="register-name">Nome completo *</label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ex: Dr. Carlos Eduardo / Ana Paula"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  disabled={carregando}
                />
              </div>

              <div className="campo-unico">
                <label htmlFor="register-email">E-mail corporativo *</label>
                <input
                  id="register-email"
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
                <label htmlFor="register-cargo">Perfil de Acesso / Cargo *</label>
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
                  <option value="Médico Clínico">Médico Clínico (Plantão & Atendimento)</option>
                  <option value="Médico Especialista">Médico Especialista</option>
                  <option value="Cirurgião">Cirurgião</option>
                  <option value="Recepcionista">Recepcionista / Triagem</option>
                  <option value="Administrador">Administrador (Gestão Hospitalar)</option>
                </select>
              </div>

              <div className="campo-unico">
                <label htmlFor="register-password">Senha de acesso (mínimo 6 caracteres) *</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Crie uma senha de acesso"
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

            <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ margin: 0 }}>
                Já possui uma conta? <Link to="/login">Entrar</Link>
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

export default Cadastro;
