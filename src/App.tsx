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
import { ConsultasVagas } from './pages/Consultas/vagas';
import { ConsultasEmpresas } from './pages/Consultas/empresas';
import { ConsultasCandidatos } from './pages/Consultas/candidatos';
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
        <Route path="/experienciaProfissional/candidatos/:id" element={<GerenciarExperienciaProfissional />} />
        <Route path="/vagas" element={<GerenciarVaga />} />
        <Route path="/consultas-empresas" element={<ConsultasEmpresas />} />
        <Route path="/consultas-candidatos" element={<ConsultasCandidatos />} />
        <Route path="/consultas-vagas" element={<ConsultasVagas />} />
      </Routes>
    </HashRouter>
  )
}
export default App

