import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div>
        <h3>Sistema Hospitalar</h3>
        <span>Gestão de atendimentos</span>
      </div>

      <div className="usuario">
        <div className="avatar">AD</div>

        <div>
          <strong>Administrador</strong>
          <span>Equipe Hospitalar</span>
        </div>
      </div>
    </header>
  );
}

export default Header;