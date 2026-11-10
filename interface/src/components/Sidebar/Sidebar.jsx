import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logoIcone">+</div>

        <div>
          <h2>Hospital</h2>
          <span>Sistema de Gestão</span>
        </div>
      </div>

      <nav>
        <NavLink to="/dashboard" end>Dashboard</NavLink>
        <NavLink to="/dashboard/pacientes">Pacientes</NavLink>
        <NavLink to="/dashboard/profissionais">Profissionais</NavLink>
        <NavLink to="/dashboard/consultas">Consultas</NavLink>
        <NavLink to="/dashboard/internacoes">Internações</NavLink>
        <NavLink to="/dashboard/quartos">Quartos</NavLink>
        <NavLink to="/dashboard/historico">Histórico Médico</NavLink>
      </nav>

    </aside>
  );
}

export default Sidebar;