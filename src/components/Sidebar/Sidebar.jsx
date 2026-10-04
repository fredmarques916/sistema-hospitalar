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
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/pacientes">Pacientes</NavLink>
        <NavLink to="/profissionais">Profissionais</NavLink>
        <NavLink to="/consultas">Consultas</NavLink>
        <NavLink to="/internacoes">Internações</NavLink>
        <NavLink to="/quartos">Quartos</NavLink>
        <NavLink to="/historico">Histórico Médico</NavLink>
      </nav>

    </aside>
  );
}

export default Sidebar;