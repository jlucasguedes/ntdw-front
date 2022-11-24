import axios from "axios";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useState, useEffect, useRef } from "react";
import { useCidade } from "../../../hooks/useCidade";
import { Cidade, Empresa, UnidadeFederativa } from "../../../interfaces/EmpresaInterface";
import { Vaga } from "../../../interfaces/InterfacesProject";
import { url } from "../../../service/HostApi";
import { MainTemplate } from "../../template/MainTemplate";

export function ConsultasEmpresas() {

  const [estado, setEstado] = useState<UnidadeFederativa | undefined>();
  const [nome, setNome] = useState<string | number | undefined>('');
  const [empresas, setEmpresas] = useState<Empresa[] | undefined>([]);
  const [estados, setEstados] = useState<UnidadeFederativa[] | undefined>([]);

  useEffect(() => {
    axios(`${url}/ufs`)
      .then(response => {
        setEstados(response.data);
      });
  },
    []);

  useEffect(() => {
    if (nome != undefined && nome.toString().trim().length > 0) {
      axios(`${url}/empresas/nomes?nome=${nome}`)
        .then(response => {
          setEmpresas(response.data)
        });
      setEstado(undefined);
    }
    setEmpresas(undefined);
  }, [nome]);


  useEffect(() => {
    if (estado != undefined) {
      axios(`${url}/empresas/ufs/${estado.id}`)
        .then(response => {
          setEmpresas(response.data)
        });
      setNome('');
    }
    setEmpresas(undefined);
  }, [estado]);

  const dt = useRef<DataTable>(null);

  const headerDataTable = (
    <div className="table-header flex justify-between items-center tablet:items-start tablet:flex-col">
      <h5 className="mx-0 my-1">Empresas</h5>
    </div>
  );

  const enderecoBodyTemplate = ({ endereco }: Empresa) => {
    return `${endereco?.cep} / ${endereco?.cidade?.uf?.nome} -  ${endereco?.cidade?.nome} / ${endereco?.logradouro} `;
  }

  const areaAtuacaoBodyTemplate = ({ areaAtuacao }: Empresa) => {
    return `${areaAtuacao?.descricao} `;
  }

  const receberNoticiasBodyTemplate = ({ receberNoticias }: Empresa) => {
    return `${receberNoticias ? 'Sim' : 'Não'} `;
  }

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <Panel header="Cosulta vaga">
          <div className="flex flex-row gap-4">
            <p className="font-bold">Nome</p>
            <InputText id="in" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
            <p className="font-bold">Estado</p>
            <Dropdown value={estado} options={estados} onChange={(e) => setEstado(e.value)} optionLabel="nome" filter showClear filterBy="nome"
              placeholder="Selecione o estado" />
          </div>
        </Panel>
      </div>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <DataTable
          value={empresas}
          ref={dt}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhuma empresa encontrada"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} empresas"
          header={headerDataTable}
          responsiveLayout="scroll">
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column className='text-black' field="id" header="ID" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="cnpj" header="CNPJ" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="razaoSocial" header="Razão Social" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={enderecoBodyTemplate} header="Endereço" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={areaAtuacaoBodyTemplate} header="Área de atuação" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="email" header="E-mail" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={receberNoticiasBodyTemplate} header="Receber Notícias" sortable style={{ minWidth: '12rem' }}></Column>
        </DataTable>
      </div>
    </MainTemplate >
  );
}