import { MainTemplate } from '../template/MainTemplate';
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import { useParams } from 'react-router-dom';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Candidato } from '../../interfaces/CandidatoInterface';
import axios from 'axios';
import { url } from '../../service/HostApi';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { DataTable, DataTableGlobalFilterType } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ExperienciaProfissional, ExperienciaProfissionalForm } from '../../interfaces/ExperienciaProfissional';
import { Controller, useForm } from 'react-hook-form';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { converToJson, formatDate } from '../../utils/ConvertUtils';
import dateFormat from "dateformat";
import { Toast } from 'primereact/toast';
import { FormaContratacao } from '../../interfaces/InterfacesProject';

type ExperienciaProfissionalParams = {
  id: string;
}

export function GerenciarExperienciaProfissional() {
  const params = useParams<ExperienciaProfissionalParams>();
  const candidatoId = params.id || '';
  const [candidato, setCandidato] = useState<Candidato>()
  const [experienciaProfissional, setExperienciaProfissional] = useState<ExperienciaProfissional | null>()
  const [selectedExperienciasProfissionais, setSelectedExperienciasProfissionais] = useState<ExperienciaProfissional[]>([]);
  const [formasContratacoes, setFormasContratacoes] = useState<FormaContratacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [experienciaProfissionalDialog, setExperienciaProfissionalDialog] = useState(false);
  const [experienciasProfissionais, setExperienciasProfissionais] = useState<ExperienciaProfissional[]>([]);
  const [globalFilter, setGlobalFilter] = useState<DataTableGlobalFilterType>('');

  const [deleteExperienciaProfissionalDialog, setDeleteExperienciaProfissionalDialog] = useState(false);
  const [deleteExperienciasProfissionaisDialog, setDeleteExperienciasProfissionaisDialog] = useState(false);

  const dt = useRef<DataTable>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    axios(`${url}/experiencias_profissionais/candidatos/${candidatoId}`)
      .then(response => {
        setExperienciasProfissionais(response.data);
      });

    axios(`${url}/candidatos/${candidatoId}`)
      .then(response => {
        setCandidato(response.data);
      });

    axios(`${url}/formasContratacao`)
      .then(response => {
        setFormasContratacoes(response.data);
      });
  }, []);

  const openNewExperienciaProfissional = () => {
    setExperienciaProfissionalDialog(true)
  }

  const confirmDeleteSelected = () => {
    setDeleteExperienciasProfissionaisDialog(true);
  }

  const leftToolbarTemplate = () => {
    return (
      <Fragment>
        <Button label="Nova" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNewExperienciaProfissional} />
        <Button label="Remover" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedExperienciasProfissionais || !selectedExperienciasProfissionais.length} />
      </Fragment>
    )
  }

  const headerDataTable = (
    <div className="table-header flex justify-between items-center tablet:items-start tablet:flex-col">
      <h5 className="mx-0 my-1">Gerenciar Candidatos</h5>
      <span className="p-input-icon-left ">
        <i className="pi pi-search tablet:w-full" />
        <InputText className='tablet:w-full' type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Filtrar..." />
      </span>
    </div>
  );

  const formaContratacaoBodyTemplate = ({ formaContratacao }: ExperienciaProfissional) => {
    return `${formaContratacao.descricao}`;
  }

  const confirmDeleteExperienciaProfissional = (experienciaProfissional: ExperienciaProfissional) => {
    setExperienciaProfissional(experienciaProfissional);
    setDeleteExperienciaProfissionalDialog(true);
  }


  const actionBodyTemplateDataTable = (rowData: ExperienciaProfissional) => {
    return (
      <Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editExperienciaProfissional(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteExperienciaProfissional(rowData)} />
      </Fragment>
    );
  }

  const editExperienciaProfissional = (experienciaProfissional: ExperienciaProfissional) => {
    let _experienciaProfissional = { ...experienciaProfissional, candidato: candidato! }
    setExperienciaProfissional({ ..._experienciaProfissional });
    setValue('id', experienciaProfissional.id);
    setValue('empresa', experienciaProfissional.empresa);
    setValue('cargo', experienciaProfissional.cargo);
    setValue('tarefasExecutadas', experienciaProfissional.tarefasExecutadas);
    setValue('dataInicio', new Date(formatDate(experienciaProfissional.dataInicio)));
    setValue('dataConclusao', new Date(formatDate(experienciaProfissional.dataConclusao)));
    setValue('formaContratacao', experienciaProfissional.formaContratacao?.id);
    setExperienciaProfissionalDialog(true);
  }

  const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm<ExperienciaProfissionalForm>({
    defaultValues: {
      empresa: '',
      cargo: '',
      tarefasExecutadas: '',
      dataInicio: undefined,
      dataConclusao: undefined,
      formaContratacao: undefined,
      candidato: undefined,
    }
  },);

  const hideCandidatoDialog = () => {
    setExperienciaProfissionalDialog(false);
    setValue('empresa', '');
    setValue('cargo', '');
    setValue('tarefasExecutadas', '');
    setValue('dataInicio', undefined);
    setValue('dataConclusao', undefined);
    setValue('formaContratacao', undefined);
    reset();
  }

  const onSubmit = async (data: ExperienciaProfissionalForm) => {
    let _experienciaProfissional = {
      empresa: data.empresa,
      cargo: data.cargo,
      tarefasExecutadas: data.tarefasExecutadas,
      dataInicio: dateFormat(data.dataInicio, 'dd/mm/yyyy'),
      dataConclusao: dateFormat(data.dataConclusao, 'dd/mm/yyyy'),
      formaContratacao: {
        id: data.formaContratacao
      },
      candidato: {
        id: candidato?.id
      }
    } as ExperienciaProfissional;
    try {
      setLoading(true);
      if (data.id) {
        await axios.put(`${url}/experiencias_profissionais/${data.id}`,
          converToJson(_experienciaProfissional),
        );
        hideCandidatoDialog();
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato editado!', life: 3000 });
      } else {
        await axios.post(`${url}/experiencias_profissionais`,
          converToJson(_experienciaProfissional)
        );
        hideCandidatoDialog();
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato cadastrado!', life: 3000 });
      }
      axios(`${url}/experiencias_profissionais`)
        .then(response => {
          setExperienciasProfissionais(response.data);
        });
      setLoading(false);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.response.data.titulo, life: 3000 });
    }
  };

  const getFormErrorMessage = (name: string) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  };

  const experienciaProfissionalDialogFooter = () => {
    return (
      <div>
        <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={hideCandidatoDialog} />
        <Button label="Cadastrar" icon="pi pi-check" className="p-button-success" onClick={handleSubmit(onSubmit)} />
      </div>
    );
  }
  const deleteExperienciaProfissional = async () => {
    await axios.delete(`${url}/experiencias_profissionais/${experienciaProfissional?.id}`);
    let _experienciaProfissional = experienciasProfissionais.filter(val => val.id !== experienciaProfissional?.id);
    setExperienciasProfissionais(_experienciaProfissional);
    setDeleteExperienciaProfissionalDialog(false);
    setExperienciaProfissional(null);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Experiência Profissional removida', life: 3000 });
  }
  const hideDeleteExperienciaProfissionalDialog = () => {
    setDeleteExperienciaProfissionalDialog(false);
  }
  const hideDeleteExperienciasProfissionaisDialog = () => {
    setDeleteExperienciasProfissionaisDialog(true)
  }

  const deleteSelectedCandidatos = async () => {
    let ids = [...selectedExperienciasProfissionais.map(v => v.id)];
    await axios.delete(`${url}/experiencias_profissionais`, { data: ids });
    let _experienciasProfissionais = experienciasProfissionais.filter(val => !selectedExperienciasProfissionais.includes(val));
    setExperienciasProfissionais(_experienciasProfissionais);
    setDeleteExperienciasProfissionaisDialog(false);
    setSelectedExperienciasProfissionais([]);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Experiências Profissionais removidas', life: 3000 });
  }
  const deleteExperienciasProfissionaisDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDeleteExperienciasProfissionaisDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-outlined p-button-success" onClick={deleteSelectedCandidatos} />
    </Fragment>
  );

  const deleteExperienciaProfissionalDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDeleteExperienciaProfissionalDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-outlined p-button-success" onClick={deleteExperienciaProfissional} />
    </Fragment>
  );

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3 flex flex-col gap-4">
        <Panel header="Candidato">
          <div className='flex flex-row gap-6'>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='font-bold text-xl text-slate-800'>Dados</span>
              </div>
              <div>
                <span className='font-bold'>Nome: </span>
                <span>{candidato?.nome}</span>
              </div>
              <div>
                <span className='font-bold'>CPF: </span>
                <span>{candidato?.cpf}</span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='font-bold text-xl text-slate-800'>Endereço</span>
              </div>
              <div>
                <span className='font-bold'>Logradouro: </span>
                <span>{candidato?.endereco.logradouro}</span>
              </div>
              <div>
                <span className='font-bold'>UF: </span>
                <span>{candidato?.endereco.cidade?.uf?.nome}</span>
              </div>
              <div>
                <span className='font-bold'>Cidade: </span>
                <span>{candidato?.endereco.cidade?.nome}</span>
              </div>
            </div>
          </div>
        </Panel>

        <Toolbar className="mb-4" left={leftToolbarTemplate} />

        <DataTable
          loading={loading}
          value={experienciasProfissionais}
          ref={dt}
          selection={selectedExperienciasProfissionais}
          onSelectionChange={(e) => setSelectedExperienciasProfissionais(e.value)}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhuma experiência profissional encontrada."
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} candidatos"
          header={headerDataTable}
          globalFilter={globalFilter}
          responsiveLayout="scroll">
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column className='text-black' field="id" header="ID" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="empresa" header="Empresa" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="cargo" header="Cargo" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="tarefasExecutadas" header="Tarefas Executadas" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="dataInicio" header="Data Inicio" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={formaContratacaoBodyTemplate} header="Forma de contratação" sortable style={{ minWidth: '12rem' }}></Column>
          <Column body={actionBodyTemplateDataTable} exportable={false} style={{ minWidth: '8rem' }}></Column>
        </DataTable>
      </div>

      <Dialog visible={experienciaProfissionalDialog}
        style={{ width: '450px' }}
        header="Cadastrar candidato"
        modal
        className="p-fluid"
        footer={experienciaProfissionalDialogFooter}
        onHide={hideCandidatoDialog}>
        <form className="p-fluid flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <h5 className='font-black'>Identificação</h5>
          <div className="field">
            <label htmlFor="empresa">Empresa</label>
            <Controller name="empresa" control={control}
              rules={{ required: 'A Empresa é obrigatória!' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  name="empresa"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('empresa')}
          </div>
          <div className="field">
            <label htmlFor="cargo">Cargo</label>
            <Controller name="cargo" control={control}
              rules={{ required: 'O Cargo é obrigatório!' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  name="cargo"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('cargo')}
          </div>
          <div className="field">
            <label htmlFor="tarefasExecutadas">Tarefas Executadas</label>
            <Controller name="tarefasExecutadas" control={control}
              rules={{ required: 'As Tarefas Executadas são obrigatórias.' }}
              render={({ field, fieldState }) => (
                <InputTextarea
                  rows={5}
                  cols={30}
                  autoResize
                  id={field.name}
                  {...field}
                  name="tarefasExecutadas"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('tarefasExecutadas')}
          </div>
          <div className="field">
            <label htmlFor="dataInicio">Data de Inicio</label>
            <Controller
              name="dataInicio"
              control={control}
              rules={{ required: 'A Data de Inicio é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Controller
                  name="dataInicio"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      id={field.name}
                      locale='pt'
                      onChange={(e) => { field.onChange(e.value); }}
                      dateFormat="dd/mm/yy" mask="99/99/9999"
                      showIcon
                      value={field.value}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                  )} />
              )}
            />
            {getFormErrorMessage('dataInicio')}
          </div>
          <div className="field">
            <label htmlFor="dataConclusao">Data de Conclusão</label>
            <Controller
              name="dataConclusao"
              control={control}
              rules={{ required: 'A Data de Conclusão é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Controller
                  name="dataConclusao"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      id={field.name}
                      locale='pt'
                      onChange={(e) => { field.onChange(e.value); }}
                      dateFormat="dd/mm/yy" mask="99/99/9999"
                      showIcon
                      value={field.value}
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                  )} />
              )}
            />
            {getFormErrorMessage('dataConclusao')}
          </div>
          <div className="field">
            <label htmlFor="formaContratacao">Forma de Contratação</label>
            <Controller name="formaContratacao" control={control}
              rules={{ required: 'Selecione uma Forma de Contratação' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione uma Forma de Contratação"
                  optionLabel='descricao'
                  optionValue='id'
                  filter
                  showClear
                  filterBy="descricao"
                  options={formasContratacoes}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('formaContratacao')}
          </div>
        </form>
      </Dialog>

      <Dialog visible={deleteExperienciaProfissionalDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteExperienciaProfissionalDialogFooter} onHide={hideDeleteExperienciaProfissionalDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {experienciaProfissional && <span>Você tem certeza que deseja deleta a experiência profissional <b>{experienciaProfissional.id}</b>?</span>}
        </div>
      </Dialog>

      <Dialog visible={deleteExperienciasProfissionaisDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteExperienciasProfissionaisDialogFooter} onHide={hideDeleteExperienciasProfissionaisDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {experienciasProfissionais && <span>Você tem certeza que deseja remover as experiências selecionadas?</span>}
        </div>
      </Dialog>
    </MainTemplate>
  );
}