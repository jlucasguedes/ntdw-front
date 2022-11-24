import axios from "axios";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useState, useEffect, useRef } from "react";
import { Empresa, UnidadeFederativa } from "../../../interfaces/EmpresaInterface";
import { Vaga } from "../../../interfaces/InterfacesProject";
import { url } from "../../../service/HostApi";
import { MainTemplate } from "../../template/MainTemplate";

export function ConsultasVagas() {


  const [empresa, setEmpresa] = useState<Empresa | undefined>();
  const [estado, setEstado] = useState<UnidadeFederativa | undefined>();
  const [cargo, setCargo] = useState<string | number | undefined>('');
  const [empresas, setEmpresas] = useState<Empresa[] | undefined>([]);
  const [estados, setEstados] = useState<UnidadeFederativa[] | undefined>([]);
  const [vagas, setVagas] = useState<Vaga[] | undefined>([]);

  useEffect(() => {
    axios(`${url}/empresas`)
      .then(response => {
        setEmpresas(response.data);
      });

    axios(`${url}/ufs`)
      .then(response => {
        setEstados(response.data);
      });
  },
    []);

  useEffect(() => {
    if (empresa != undefined) {
      axios(`${url}/vagas/empresas/${empresa?.id}`)
        .then(response => {
          setVagas(response.data)
        });
      setCargo('');
      setEstado(undefined);
    }
    setVagas(undefined);
  },
    [empresa]);

  useEffect(() => {
    if (cargo != undefined && cargo.toString().trim().length > 0) {
      axios(`${url}/vagas/cargos?cargo=${cargo}`)
        .then(response => {
          setVagas(response.data)
        });
      setEmpresa(undefined);
      setEstado(undefined);
    }
    setVagas(undefined);
  }, [cargo]);


  useEffect(() => {
    if (estado != undefined) {
      axios(`${url}/vagas/ufs/${estado.id}`)
        .then(response => {
          setVagas(response.data)
        });
      setEmpresa(undefined);
      setCargo('');
    }
    setVagas(undefined);
  }, [estado]);

  const headerDataTable = (
    <div className="table-header flex justify-between items-center tablet:items-start tablet:flex-col">
      <h5 className="mx-0 my-1">Gerenciar Vaga</h5>
    </div>
  );

  const dt = useRef<DataTable>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  const remuneracaoBodyTemplateDataTable = ({ remuneracao }: Vaga) => {
    return formatCurrency(remuneracao);
  }
  const formaContratacaoBodyTemplateDataTable = ({ formaContratacao }: Vaga) => {
    return formaContratacao?.descricao;
  }
  const ufBodyTemplateDataTable = ({ uf }: Vaga) => {
    return uf?.nome;
  }

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <Panel header="Cosulta vaga">
          <div className="flex flex-row gap-4">
            <p className="font-bold">Empresa</p>
            <Dropdown value={empresa} options={empresas} onChange={(e) => setEmpresa(e.value)} optionLabel="razaoSocial" filter showClear filterBy="razaoSocial"
              placeholder="Selecione a empresa" />
            <p className="font-bold">Cargo</p>
            <InputText id="in" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Cargo" />
            <p className="font-bold">Estado</p>
            <Dropdown value={estado} options={estados} onChange={(e) => setEstado(e.value)} optionLabel="nome" filter showClear filterBy="nome"
              placeholder="Selecione o estado" />
          </div>
        </Panel>
      </div>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <Panel header="Empresa">
          <div className='flex flex-row gap-6'>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='font-bold text-xl text-slate-800'>Dados</span>
              </div>
              <div>
                <span className='font-bold'>Razão Social: </span>
                <span>{empresa?.razaoSocial}</span>
              </div>
              <div>
                <span className='font-bold'>CNPJ: </span>
                <span>{empresa?.cnpj}</span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='font-bold text-xl text-slate-800'>Endereço</span>
              </div>
              <div>
                <span className='font-bold'>Logradouro: </span>
                <span>{empresa?.endereco?.logradouro}</span>
              </div>
              <div>
                <span className='font-bold'>UF: </span>
                <span>{empresa?.endereco?.cidade?.uf?.nome}</span>
              </div>
              <div>
                <span className='font-bold'>Cidade: </span>
                <span>{empresa?.endereco?.cidade?.nome}</span>
              </div>
            </div>
          </div>
        </Panel>

        <DataTable
          value={vagas}
          ref={dt}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhuma vaga encontrada"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} vagas"
          header={headerDataTable}
          responsiveLayout="stack">
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column field="id" header="ID" sortable style={{ minWidth: '12rem' }} />
          <Column field="cargo" header="Cargo" sortable style={{ minWidth: '12rem' }} />
          <Column field="remuneracao" header="Remuneração" body={remuneracaoBodyTemplateDataTable} sortable style={{ minWidth: '12rem' }} />
          <Column field="turno" header="Turno" sortable style={{ minWidth: '12rem' }} />
          <Column field="formaContratacao" header="Forma de contratação" body={formaContratacaoBodyTemplateDataTable} sortable style={{ minWidth: '12rem' }} />
          <Column field="uf" header="Estado" body={ufBodyTemplateDataTable} sortable style={{ minWidth: '12rem' }} />
        </DataTable>
      </div>
    </MainTemplate >
  );
}