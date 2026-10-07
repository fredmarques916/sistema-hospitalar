import { Routes, Route, Outlet } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";

import Dashboard from "./pages/Dashboard/Dashboard";
import Pacientes from "./pages/Pacientes/Pacientes";
import Profissionais from "./pages/Profissionais/Profissionais";
import Consultas from "./pages/Consultas/Consultas";
import Internacoes from "./pages/Internacoes/Internacoes";
import Quartos from "./pages/Quartos/Quartos";
import Historico from "./pages/Historico/Historico";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";

import "./App.css";

function AppLayout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="conteudo">
        <Header />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rotas Privadas (Sistema) */}
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="profissionais" element={<Profissionais />} />
        <Route path="consultas" element={<Consultas />} />
        <Route path="internacoes" element={<Internacoes />} />
        <Route path="quartos" element={<Quartos />} />
        <Route path="historico" element={<Historico />} />
      </Route>
    </Routes>
  );
}

export default App;