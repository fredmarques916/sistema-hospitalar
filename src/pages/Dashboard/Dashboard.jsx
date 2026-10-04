import Card from "../../components/Card/Card";
import "./Dashboard.css";


function Dashboard() {
  return (
    <div>
      <div className="tituloPagina">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema hospitalar</p>
      </div>

      <div className="cardsDashboard">

        <Card
          titulo="Pacientes cadastrados"
          valor="248"
          descricao="Pacientes registrados"
        />

        <Card
          titulo="Consultas hoje"
          valor="18"
          descricao="Consultas agendadas"
        />

        <Card
          titulo="Internações"
          valor="32"
          descricao="Pacientes internados"
        />

        <Card
          titulo="Quartos disponíveis"
          valor="14"
          descricao="Quartos disponíveis"
        />

      </div>

      <div className="painel">
        <h2>Próximas consultas</h2>

        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Profissional</th>
              <th>Especialidade</th>
              <th>Horário</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Maria Silva</td>
              <td>Dr. Carlos Mendes</td>
              <td>Cardiologia</td>
              <td>09:00</td>
            </tr>

            <tr>
              <td>João Santos</td>
              <td>Dra. Ana Costa</td>
              <td>Clínica Geral</td>
              <td>10:30</td>
            </tr>

            <tr>
              <td>Pedro Oliveira</td>
              <td>Dr. Lucas Rocha</td>
              <td>Ortopedia</td>
              <td>11:00</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;