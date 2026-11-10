import { Link } from "react-router-dom";
import "./Home.css";

const modules = [
  {
    title: "Pacientes",
    description: "Cadastros e informações organizados em um só lugar.",
  },
  {
    title: "Consultas",
    description: "Acompanhe os atendimentos e a agenda da equipe.",
  },
  {
    title: "Internações",
    description: "Consulte internações e disponibilidade de quartos.",
  },
  {
    title: "Profissionais",
    description: "Mantenha os dados da equipe médica atualizados.",
  },
];

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <Link to="/" className="home-logo" aria-label="Hospital — página inicial">
          <span className="home-logoIcone" aria-hidden="true">+</span>
          <span className="home-logoText">
            <strong>Hospital</strong>
            <span>Sistema de Gestão</span>
          </span>
        </Link>

        <nav className="home-nav" aria-label="Navegação principal">
          <a href="#recursos" className="nav-link">Recursos</a>
          <Link to="/login" className="btn-outline">Entrar</Link>
          <Link to="/cadastro" className="btn-primary">Criar conta</Link>
        </nav>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-eyebrow">Gestão hospitalar</p>
            <h1>Mais clareza para cuidar da rotina do hospital.</h1>
            <p className="hero-description">
              Reúna pacientes, consultas, internações e equipe em um sistema
              simples de acompanhar e usar no dia a dia.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary hero-btn">
                Acessar sistema
              </Link>
              <a href="#recursos" className="btn-secondary hero-btn">
                Conhecer recursos
              </a>
            </div>
          </div>

          <aside className="hero-summary" aria-label="Áreas do sistema">
            <div className="summary-heading">
              <span className="summary-indicator" aria-hidden="true" />
              <div>
                <p>Visão geral</p>
                <h2>Áreas do sistema</h2>
              </div>
            </div>
            <ul className="summary-list">
              <li><span>Pacientes</span><span>Cadastros</span></li>
              <li><span>Consultas</span><span>Agendamentos</span></li>
              <li><span>Internações</span><span>Leitos e quartos</span></li>
              <li><span>Equipe médica</span><span>Profissionais</span></li>
            </ul>
            <p className="summary-note">
              Informações essenciais reunidas em um único ambiente.
            </p>
          </aside>
        </section>

        <section id="recursos" className="features-section">
          <div className="section-title">
            <p className="section-eyebrow">Recursos</p>
            <h2>O essencial para a gestão diária</h2>
            <p>
              Acesse as principais áreas da operação sem complicar a rotina da
              equipe.
            </p>
          </div>

          <div className="features-grid">
            {modules.map((module) => (
              <article className="feature-card" key={module.title}>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div>
            <p className="section-eyebrow">Sistema de Gestão Hospitalar</p>
            <h2>Comece pela rotina da sua equipe.</h2>
          </div>
          <Link to="/login" className="btn-primary">
            Entrar no sistema
          </Link>
        </section>
      </main>

      <footer className="home-footer">
        <span>Hospital · Sistema de Gestão</span>
        <span>Gestão clara para o cuidado diário.</span>
      </footer>
    </div>
  );
}

export default Home;
