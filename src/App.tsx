import './styles/main.css';
import './styles/prime-theme.css';
import "primereact/resources/themes/saga-blue/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";

import { Routes, Route, HashRouter } from "react-router-dom";
import { Home } from './pages/Home';
import { Inscricao } from './pages/Inscricao/index';
import { GerenciarCandidato } from './pages/Candidato/index'
import { GerenciarVaga } from './pages/Vaga';
import { GerenciarEmpresa } from './pages/Empresa';
import { locale, addLocale } from 'primereact/api';
import pt from './locale/pt.json';
import { GerenciarExperienciaProfissional } from './pages/ExperienciaProfissional';
function App() {
  addLocale('pt-BR', pt)
  locale('pt-BR');
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empresas" element={<GerenciarEmpresa />} />
        <Route path="/candidatos" element={<GerenciarCandidato />} />
        <Route path="/inscricoes" element={<Inscricao />} />
        <Route path="/experienciaProfissional/candidatos/:id" element={<GerenciarExperienciaProfissional />} />
        <Route path="/vagas" element={<GerenciarVaga />} />
      </Routes>
    </HashRouter>
  )
}

export default App

