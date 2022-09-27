interface IObjectKeys {
  [key: string]: string | number | undefined | Endereco | AreaAtuacao | boolean | Cidade | UnidadeFederativa;
}

export interface FormEmpresa extends IObjectKeys {
  empresa: Empresa;
  ufSelected?: UnidadeFederativa;
  cidadeSelected?: Cidade;
}

export interface EmpresaForm extends IObjectKeys {
  id?: number;
  cnpj?: string;
  razaoSocial?: string;
  email?: string;
  receberNoticias?: boolean;
  logradouro?: string;
  cep?: string;
  tipoEndereco?: string;
  cidade?: number;
  uf?: number;
  areaAtuacao?: number;
}

export interface Empresa extends IObjectKeys {
  id?: number;
  razaoSocial: string;
  cnpj: string;
  endereco?: Endereco,
  areaAtuacao?: AreaAtuacao,
  email?: string;
  receberNoticias: boolean;
}

export interface Endereco extends IObjectKeys {
  id?: number;
  logradouro: string;
  cep: string;
  tipoEndereco: string;
  cidade?: Cidade;
}

export interface AreaAtuacao extends IObjectKeys {
  id?: number
  descricao?: string;
}

export interface UnidadeFederativa extends IObjectKeys {
  id?: number
  codigo?: number;
  nome?: string;
  sigla?: string;
}

export interface Cidade extends IObjectKeys {
  id?: number
  codigo?: string;
  nome?: string;
  uf?: UnidadeFederativa;
}