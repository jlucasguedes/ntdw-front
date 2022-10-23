import { Candidato } from "./CandidatoInterface";
import { Endereco } from "./EmpresaInterface";
import { FormaContratacao } from "./InterfacesProject";

interface IExperienciaProfissionalKeys {
  [key: string]: string | number | undefined | Date | Date[] | FormaContratacao | Candidato;
}

export interface ExperienciaProfissionalForm extends IExperienciaProfissionalKeys {
  id?: number;
  empresa?: string;
  cargo?: string;
  tarefasExecutadas?: string;
  dataInicio?: Date;
  dataConclusao?: Date;
  formaContratacao?: number,
  candidato?: number,
}

export interface ExperienciaProfissional extends IExperienciaProfissionalKeys {
  id?: number;
  empresa: string;
  cargo: string;
  tarefasExecutadas: string;
  dataInicio: string;
  dataConclusao: string;
  formaContratacao: FormaContratacao,
  candidato: Candidato,
}

