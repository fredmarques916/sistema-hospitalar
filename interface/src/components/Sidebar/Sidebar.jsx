import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../../services/api";
import "./Sidebar.css";

function Sidebar() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    async function testConexao() {
      const isOnline = await api.checkHealth();
      setOnline(isOnline);
    }
    testConexao();
    const interval = setInterval(testConexao, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6v12m-6-6h12" />
          </svg>
        </div>
        <div className="brand-info">
          <h2>Hospitalar</h2>
          <span>Centro Médico Universitário</span>
        </div>
      </div>

      <div className="sidebar-section-title">Navegação Principal</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard/pacientes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Pacientes</span>
        </NavLink>

        <NavLink to="/dashboard/profissionais" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
          <span>Corpo Clínico</span>
        </NavLink>

        <NavLink to="/dashboard/consultas" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="m9 16 2 2 4-4" />
          </svg>
          <span>Atendimentos</span>
        </NavLink>

        <NavLink to="/dashboard/internacoes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4v16" />
            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
            <path d="M2 17h20" />
            <path d="M6 8v9" />
          </svg>
          <span>Internações</span>
        </NavLink>

        <NavLink to="/dashboard/quartos" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Quartos & Leitos</span>
        </NavLink>

        <NavLink to="/dashboard/historico" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
          <span>Prontuário</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className={`status-pill ${online ? "online" : "offline"}`}>
          <span className="status-dot"></span>
          <span>{online ? "API & SQLite Online" : "Servidor Offline"}</span>
        </div>
        <div className="db-info">Base: hospital.db</div>
      </div>
    </aside>
  );
}

export default Sidebar;
