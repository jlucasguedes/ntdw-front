import { InputTextareaProps } from "primereact/inputtextarea";
import { Empresa, UnidadeFederativa } from "./EmpresaInterface";

interface VagaKeys {
  [key: string]: string | number | undefined | boolean | Empresa | FormaContratacao | UnidadeFederativa;
}

export interface FormaContratacao {
  id: number;
  descricao: string;
}

export interface Vaga extends VagaKeys {
  id?: number;
  empresa?: Empresa;
  cargo?: string;
  especificacao?: string;
  remuneracao: number;
  valeTransporte?: boolean;
  valeRefeicao?: boolean;
  outro?: string;
  turno?: string;
  formaContratacao?: FormaContratacao;
  uf?: UnidadeFederativa;
}

export interface VagaForm extends VagaKeys {
  id?: number;
  empresa?: number;
  cargo?: string;
  especificacao?: string;
  remuneracao: number;
  valeTransporte?: boolean;
  valeRefeicao?: boolean;
  outro?: string;
  turno?: string;
  formaContratacao?: number;
  uf?: number;
}

