import axios from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useCidade } from "../../../hooks/useCidade";
import { Candidato } from "../../../interfaces/CandidatoInterface";
import { Cidade, UnidadeFederativa } from "../../../interfaces/EmpresaInterface";
import { Vaga } from "../../../interfaces/InterfacesProject";
import { url } from "../../../service/HostApi";
import { MainTemplate } from "../../template/MainTemplate";

export function ConsultasCandidatos() {

  const [estado, setEstado] = useState<UnidadeFederativa | undefined>();
  const [cidade, setCidade] = useState<Cidade | undefined>();
  const [cargo, setCargo] = useState<string | number | undefined>('');
  const [estados, setEstados] = useState<UnidadeFederativa[] | undefined>([]);
  const [candidatos, setCandidatos] = useState<Vaga[] | undefined>([]);

  useEffect(() => {
    axios(`${url}/ufs`)
      .then(response => {
        setEstados(response.data);
      });
  },
    []);

  useEffect(() => {
    if (cidade != undefined) {
      axios(`${url}/candidatos/cidades/${cidade?.id}`)
        .then(response => {
          setCandidatos(response.data)
        });
      setCargo('');
    }
    setCandidatos(undefined);
  },
    [cidade]);

  useEffect(() => {
    if (cargo != undefined && cargo.toString().trim().length > 0) {
      axios(`${url}/candidatos/cargos?cargo=${cargo}`)
        .then(response => {
          setCandidatos(response.data)
        });
      setCidade(undefined);
      setEstado(undefined);
    }
    setCandidatos(undefined);
  }, [cargo]);


  const cidades = useCidade(estado?.id?.toString());

  useEffect(() => {
    if (estado != undefined) {
      axios(`${url}/candidatos/estado/${estado.id}`)
        .then(response => {
          setCandidatos(response.data)
        });
      setCidade(undefined);
      setCargo('');
    }
    setCandidatos(undefined);
  }, [estado]);



  const dt = useRef<DataTable>(null);
  let navigate = useNavigate();

  const carregaExperienciaProfissional = (candidato: Candidato) => {
    navigate(`/experienciaProfissional/candidatos/${candidato.id!}`)
  }

  const actionBodyTemplateDataTable = (rowData: Candidato) => {
    return (
      <Fragment>
        <Button icon="pi pi-list" className="p-button-rounded p-button-success mr-2" onClick={() => carregaExperienciaProfissional(rowData)} />
      </Fragment>
    );
  }


  const receberNoticiasBodyTemplate = ({ receberNoticias }: Candidato) => {
    return `${receberNoticias ? 'Sim' : 'Não'} `;
  }

  const headerDataTable = (
    <div className="table-header flex justify-between items-center tablet:items-start tablet:flex-col">
      <h5 className="mx-0 my-1">Gerenciar Candidatos</h5>
    </div>
  );

  const enderecoBodyTemplate = ({ endereco }: Candidato) => {
    return `${endereco?.cep} / ${endereco?.cidade?.nome} / ${endereco?.logradouro} `;
  }

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <Panel header="Cosulta vaga">
          <div className="flex flex-row gap-4">
            <InputText id="in" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Cargo" />
            <p className="font-bold">Estado</p>
            <Dropdown value={estado} options={estados} onChange={(e) => setEstado(e.value)} optionLabel="nome" filter showClear filterBy="nome"
              placeholder="Selecione o estado" />
            <p className="font-bold">Cidade</p>
            <Dropdown value={cidade} options={cidades} onChange={(e) => setCidade(e.value)} optionLabel="nome" filter showClear filterBy="nome"
              placeholder="Selecione a cidade" />
          </div>
        </Panel>
      </div>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <DataTable
          value={candidatos}
          ref={dt}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhum candidato encontrado"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} candidatos"
          header={headerDataTable}
          responsiveLayout="scroll">
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column className='text-black' field="id" header="ID" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="nome" header="Nome" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="cpf" header="CPF" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={enderecoBodyTemplate} header="Endereço" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="sexo" header="Sexo" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="dataNascimento" header="Data de nascimento" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="email" header="E-mail" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={receberNoticiasBodyTemplate} header="Receber Notícias" sortable style={{ minWidth: '12rem' }}></Column>
          <Column body={actionBodyTemplateDataTable} exportable={false} style={{ minWidth: '8rem' }}></Column>
        </DataTable>
      </div>
    </MainTemplate >
  );
}