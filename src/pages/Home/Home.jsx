import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* HEADER */}
      <header className="home-header">
        <div className="home-logo">
          <div className="home-logoIcone">+</div>
          <div>
            <h2>Hospital</h2>
            <span>Sistema de Gestão</span>
          </div>
        </div>
        <nav className="home-nav">
          <a href="#recursos" className="nav-link">Recursos</a>
          <a href="#beneficios" className="nav-link">Benefícios</a>
          <div className="divider"></div>
          <Link to="/login" className="btn-outline">Entrar</Link>
          <Link to="/cadastro" className="btn-primary">Cadastrar</Link>
        </nav>
      </header>

      <main className="home-main">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="badge">✨ O futuro da gestão em saúde</div>
            <h1>Gestão Hospitalar <span className="highlight">Simplificada</span> e Inteligente</h1>
            <p>
              O sistema definitivo para modernizar o seu hospital. Tenha controle total sobre pacientes, prontuários, equipe médica, internações e financeiro em uma única plataforma intuitiva.
            </p>
            <div className="hero-actions">
              <Link to="/cadastro" className="btn-primary hero-btn">Começar Gratuitamente</Link>
              <Link to="/login" className="btn-secondary hero-btn">Acessar Sistema</Link>
            </div>
            <div className="hero-stats-mini">
              <span>✅ +500 Hospitais</span>
              <span>✅ Dados Seguros</span>
              <span>✅ Suporte 24/7</span>
            </div>
          </div>
          
          {/* Dashboard Preview/Abstract Illustration */}
          <div className="hero-image-wrapper">
            <div className="abstract-dashboard">
              <div className="dash-header"></div>
              <div className="dash-body">
                <div className="dash-sidebar"></div>
                <div className="dash-content">
                  <div className="dash-cards">
                    <div className="d-card"></div>
                    <div className="d-card"></div>
                    <div className="d-card"></div>
                  </div>
                  <div className="dash-table">
                    <div className="t-row"></div>
                    <div className="t-row"></div>
                    <div className="t-row"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ESTATÍSTICAS */}
        <section className="stats-section">
          <div className="stat-item">
            <h2>10k+</h2>
            <p>Pacientes Gerenciados</p>
          </div>
          <div className="stat-item">
            <h2>99.9%</h2>
            <p>Uptime do Servidor</p>
          </div>
          <div className="stat-item">
            <h2>50+</h2>
            <p>Especialidades Atendidas</p>
          </div>
          <div className="stat-item">
            <h2>24h</h2>
            <p>Monitoramento Contínuo</p>
          </div>
        </section>

        {/* RECURSOS */}
        <section id="recursos" className="features-section">
          <div className="section-title">
            <h2>Tudo o que seu hospital precisa</h2>
            <p>Desenvolvido para atender a todas as demandas de clínicas e grandes hospitais.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Gestão de Pacientes</h3>
              <p>Histórico médico detalhado, prontuário eletrônico e cadastro unificado em um só lugar.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Agendamentos</h3>
              <p>Controle de consultas inteligente, reduzindo filas de espera e otimizando a agenda médica.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h3>Internações & Quartos</h3>
              <p>Acompanhe a disponibilidade de leitos e o status das internações em tempo real.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🩺</div>
              <h3>Equipe Médica</h3>
              <p>Gerencie escalas, especialidades e o desempenho de todos os profissionais de saúde.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Painéis Dinâmicos</h3>
              <p>Dashboards atualizados em tempo real com os principais indicadores de desempenho.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Segurança Máxima</h3>
              <p>Seus dados são criptografados de ponta a ponta, seguindo as diretrizes da LGPD.</p>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section id="beneficios" className="benefits-section">
          <div className="benefits-content">
            <h2>Por que escolher o nosso sistema?</h2>
            <ul className="benefits-list">
              <li>
                <span className="b-icon">🚀</span>
                <div>
                  <strong>Implantação Rápida</strong>
                  <p>Sistema na nuvem, sem necessidade de servidores físicos complexos.</p>
                </div>
              </li>
              <li>
                <span className="b-icon">📱</span>
                <div>
                  <strong>Acesso em qualquer lugar</strong>
                  <p>Acesse o painel do seu computador, tablet ou celular com interface responsiva.</p>
                </div>
              </li>
              <li>
                <span className="b-icon">💬</span>
                <div>
                  <strong>Suporte Especializado</strong>
                  <p>Nossa equipe está pronta para ajudar a qualquer momento do dia ou da noite.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="benefits-image">
            <div className="circle-bg"></div>
            <div className="floating-card c1">Prontuários 100% Digitais</div>
            <div className="floating-card c2">Redução de Custos</div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="cta-section">
          <h2>Pronto para revolucionar seu hospital?</h2>
          <p>Junte-se a centenas de instituições que já modernizaram suas rotinas.</p>
          <Link to="/cadastro" className="btn-primary btn-large">Criar Conta Agora</Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="home-logoIcone small-icon">+</div>
            <span>Hospital Manager</span>
          </div>
          <div className="footer-links">
            <span>© 2026 Sistema Hospitalar. Todos os direitos reservados.</span>
            <div className="links-right">
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
