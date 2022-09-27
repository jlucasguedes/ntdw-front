import './styles/main.css';
import './styles/prime-theme.css';
import "primereact/resources/themes/saga-blue/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";

import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { Home } from './pages/Home';
import { CadastroEmpresa } from './pages/Empresa/index';
import { Inscricao } from './pages/Inscricao/index';
import { GerenciarCandidato } from './pages/Candidato/index'

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empresas" element={<CadastroEmpresa />} />
        <Route path="/candidatos" element={<GerenciarCandidato />} />
        <Route path="/inscricoes" element={<Inscricao />} />
      </Routes>
    </HashRouter>

  )
}

export default App

