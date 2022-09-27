import { Endereco } from "./EmpresaInterface";

interface ICandidatoKeys {
  [key: string]: string | number | undefined | Endereco | boolean | 'Masculino' | 'Feminino' | Date | Date[];
}

export interface CandidatoForm extends ICandidatoKeys {
  id?: number;
  nome?: string;
  sexo?: 'Masculino' | 'Feminino';
  cpf?: string,
  rg?: string,
  orgaoExpedidor?: string;
  dataExpedicao?: Date;
  dataNascimento?: Date;
  email?: string;
  telefoneCelular?: string;
  telefoneResidencial?: string;
  receberNoticias?: boolean;
  logradouro?: string,
  cep?: string,
  tipoEndereco?: string,
  cidade?: number,
  uf?: number,
}

export interface Candidato extends ICandidatoKeys {
  id?: number;
  nome: string;
  sexo: 'Masculino' | 'Feminino';
  cpf: string,
  rg: string,
  orgaoExpedidor: string;
  dataExpedicao: string;
  dataNascimento: string;
  email: string;
  telefoneCelular: string;
  telefoneResidencial: string;
  receberNoticias: boolean;
  endereco: Endereco;
}

