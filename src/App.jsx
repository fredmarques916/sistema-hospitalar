import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";

import Dashboard from "./pages/Dashboard/Dashboard";
import Pacientes from "./pages/Pacientes/Pacientes";
import Profissionais from "./pages/Profissionais/Profissionais";
import Consultas from "./pages/Consultas/Consultas";
import Internacoes from "./pages/Internacoes/Internacoes";
import Quartos from "./pages/Quartos/Quartos";
import Historico from "./pages/Historico/Historico";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="conteudo">
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/internacoes" element={<Internacoes />} />
            <Route path="/quartos" element={<Quartos />} />
            <Route path="/historico" element={<Historico />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;