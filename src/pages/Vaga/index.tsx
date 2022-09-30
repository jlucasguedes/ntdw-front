import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableGlobalFilterType } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Fragment, useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Empresa, UnidadeFederativa } from '../../interfaces/EmpresaInterface';
import { FormaContratacao, Vaga, VagaForm } from '../../interfaces/InterfacesProject';
import { MainTemplate } from '../template/MainTemplate';
import { ToggleButton } from 'primereact/togglebutton';
import { turno } from '../../enums/EnumApi';
import { url } from '../../service/HostApi';

export function GerenciarVaga() {

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formasContratacao, setFormasContratacao] = useState<FormaContratacao[]>([]);
  const [ufs, setUfs] = useState<UnidadeFederativa[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [selectedVagas, setSelectedVagas] = useState<Vaga[]>([]);
  const [globalFilter, setGlobalFilter] = useState<DataTableGlobalFilterType>('');
  const [loading, setLoading] = useState(true);
  const [deleteVagaDialog, setDeleteVagaDialog] = useState(false);
  const [deleteVagasDialog, setDeleteVagasDialog] = useState(false);
  const [vagaDialog, setVagaDialog] = useState(false);

  const openNew = () => {
    setVagaDialog(true);
    setValue('empresa', undefined);
    setValue('remuneracao', 0.00);
    setValue('uf', undefined);
    setValue('formaContratacao', undefined);
    setValue('valeRefeicao', false);
    setValue('valeTransporte', false);
    reset();
  }

  const hideVagaDialog = () => {
    setVagaDialog(false);
    reset();
  }

  const dt = useRef<DataTable>(null);
  const toast = useRef<Toast>(null);

  //Botões toolbar Nova vaga e Remover vaga
  const leftToolbarTemplate = () => {
    return (
      <Fragment>
        <Button label="Nova" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
        <Button label="Remover" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedVagas || !selectedVagas.length} />
      </Fragment>
    )
  }

  const headerDataTable = (
    <div className="table-header flex justify-between items-center tablet:items-start tablet:flex-col">
      <h5 className="mx-0 my-1">Gerenciar Vaga</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search tablet:w-full" />
        <InputText className='tablet:w-full' type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Filtrar..." />
      </span>
    </div>
  );

  /** Templates de exibição das colunas do datatable */
  const empresaBodyTemplateDataTable = ({ empresa }: Vaga) => {
    return empresa?.razaoSocial;
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
  const actionBodyTemplateDataTable = (rowData: Vaga) => {
    return (
      <Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editVaga(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteVaga(rowData)} />
      </Fragment>
    );
  }
  /** Fim Templates de exibição das colunas do datatable */


  /** Dialog para deletar apenas 1 produto por vez */

  const deleteVaga = async () => {
    await axios.delete(`${url}/vagas/${vaga?.id}`);
    let _vagas = vagas.filter(val => val.id !== vaga?.id);
    setVagas(_vagas);
    setDeleteVagaDialog(false);
    setVaga(null);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Vaga removida', life: 3000 });
  }
  const hideDeleteVagaDialog = () => {
    setDeleteVagaDialog(false);
  }
  const deleteVagaDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={hideDeleteVagaDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={deleteVaga} />
    </Fragment>
  );
  const confirmDeleteVaga = (vaga: Vaga) => {
    setVaga(vaga);
    setDeleteVagaDialog(true);
  }
  /** Fim Dialog para deletar apenas 1 produto por vez */

  const deleteSelectedVagas = async () => {
    let ids = [...selectedVagas.map(v => v.id)];
    await axios.delete(`${url}/vagas`, { data: ids });
    let _vagas = vagas.filter(val => !selectedVagas.includes(val));
    setVagas(_vagas);
    setDeleteVagasDialog(false);
    setSelectedVagas([]);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Vagas removidas', life: 3000 });
  }
  /** Dialog para deletar varios ou 1 produto de uma vez */
  const confirmDeleteSelected = () => {
    setDeleteVagasDialog(true);
  }
  const hideDeleteVagasDialog = () => {
    setDeleteVagasDialog(false);
  }
  const deleteVagasDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={hideDeleteVagasDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedVagas} />
    </Fragment>
  );
  /** Fim para deletar varios ou 1 produto de uma vez */

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const vagaDialogFooter = () => {
    return (
      <div>
        <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={hideVagaDialog} />
        <Button label="Cadastrar" icon="pi pi-check" className="p-button-success" onClick={handleSubmit(onSubmit)} />
      </div>
    );
  }

  /** Hook que valida o formulário*/
  const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm<VagaForm>({
    defaultValues: {
      id: undefined,
      empresa: undefined,
      cargo: '',
      especificacao: '',
      remuneracao: undefined,
      valeTransporte: false,
      valeRefeicao: false,
      outro: '',
      turno: '',
      formaContratacao: undefined,
      uf: undefined,
    }
  },);

  const getFormErrorMessage = (name: string) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  };

  useEffect(() => {
    axios(`${url}/vagas`)
      .then(response => {
        setVagas(response.data);
        setLoading(false);
      });
    axios(`${url}/empresas`)
      .then(response => {
        setEmpresas(response.data);
      });
    axios(`${url}/formasContratacao`)
      .then(response => {
        setFormasContratacao(response.data);
      });
    axios(`${url}/ufs`)
      .then(response => {
        setUfs(response.data);
      });

  }, []);

  const editVaga = (vaga: Vaga) => {
    setVaga({ ...vaga });
    setValue('id', vaga.id);
    setValue('empresa', vaga.empresa?.id);
    setValue('cargo', vaga.cargo);
    setValue('especificacao', vaga.especificacao);
    setValue('remuneracao', vaga.remuneracao);
    setValue('valeTransporte', vaga.valeTransporte);
    setValue('valeRefeicao', vaga.valeRefeicao);
    setValue('outro', vaga.outro);
    setValue('turno', vaga.turno);
    setValue('formaContratacao', vaga.formaContratacao?.id);
    setValue('uf', vaga.uf?.id);
    setVagaDialog(true);
  }

  function converToJson(data: any) {
    let json = JSON.stringify(data);
    let emp = JSON.parse(json);
    return emp;
  }

  const findIndexById = (id: number) => {
    let index = -1;
    for (let i = 0; i < vagas.length; i++) {
      if (vagas[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }
  const onSubmit = async (data: VagaForm) => {
    let _vaga = {
      id: data.id,
      empresa: {
        id: data.empresa
      },
      cargo: data.cargo,
      especificacao: data.especificacao,
      remuneracao: data.remuneracao,
      valeTransporte: data.valeTransporte,
      valeRefeicao: data.valeTransporte,
      outro: data.outro,
      turno: data.turno,
      formaContratacao: {
        id: data.formaContratacao
      },
      uf: {
        id: data.uf
      }
    }
    let _vagas = [...vagas]
    try {
      if (_vaga.id) {
        await axios.put(`${url}/vagas/${_vaga.id}`, converToJson(_vaga));
        await axios(`${url}/vagas/${_vaga.id}`)
          .then(response => {
            const index = findIndexById(response.data.id);
            _vagas[index] = response.data;
            setVagas(_vagas);
          });
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Vaga editada!', life: 3000 });
      } else {
        const response = await axios.post(`${url}/vagas`, converToJson(_vaga));
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Vaga criada!', life: 3000 });
      }
      axios(`${url}/vagas`)
        .then(response => {
          setVagas(response.data);
        });
      hideVagaDialog();
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.response.data.titulo, life: 3000 });
    }
  };

  /** Fim Hook que valida o formulário*/

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3">
        <Toast ref={toast} />
        <Toolbar className="mb-4" left={leftToolbarTemplate} />

        <DataTable
          loading={loading}
          value={vagas}
          ref={dt}
          selection={selectedVagas}
          onSelectionChange={(e) => setSelectedVagas(e.value)}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhuma vaga encontrada"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} vagas"
          header={headerDataTable}
          globalFilter={globalFilter}
          responsiveLayout="stack">
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column field="id" header="ID" sortable style={{ minWidth: '12rem' }} />
          <Column field="empresa" header="Empresa" body={empresaBodyTemplateDataTable} style={{ minWidth: '12rem' }} />
          <Column field="cargo" header="Cargo" sortable style={{ minWidth: '12rem' }} />
          <Column field="remuneracao" header="Remuneração" body={remuneracaoBodyTemplateDataTable} sortable style={{ minWidth: '12rem' }} />
          <Column field="turno" header="Turno" sortable style={{ minWidth: '12rem' }} />
          <Column field="formaContratacao" header="Forma de contratação" body={formaContratacaoBodyTemplateDataTable} sortable style={{ minWidth: '12rem' }} />
          <Column field="uf" header="Estado" body={ufBodyTemplateDataTable} sortable style={{ minWidth: '12rem' }} />
          <Column body={actionBodyTemplateDataTable} exportable={false} style={{ minWidth: '8rem' }}></Column>
        </DataTable>
      </div>

      <Dialog visible={vagaDialog}
        style={{ width: '450px' }}
        header="Cadastrar empresa"
        modal
        className="p-fluid"
        footer={vagaDialogFooter}
        onHide={hideVagaDialog}>
        <form className="p-fluid flex flex-col gap-4" >
          <div className="field">
            <label htmlFor="empresa">Empresa</label>
            <Controller name="empresa" control={control}
              rules={{ required: 'A empresa é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione uma empresa"
                  optionLabel='razaoSocial'
                  optionValue='id'
                  filter
                  showClear
                  filterBy="razaoSocial"
                  options={empresas}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('empresa')}
          </div>
          <div className="field">
            <label htmlFor="cargo">Cargo</label>
            <Controller name="cargo" control={control}
              rules={{ required: 'O cargo é obrigatório.' }}
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
            <label htmlFor="especificacao">Especificação</label>
            <Controller name="especificacao" control={control}
              rules={{ required: 'A especificação é obrigatória.' }}
              render={({ field, fieldState }) => (
                <InputTextarea
                  rows={5}
                  cols={30}
                  autoResize
                  id={field.name}
                  {...field}
                  name="especificacao"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('especificacao')}
          </div>
          <div className="field">
            <label htmlFor="remuneracao">Remuneração</label>
            <Controller name="remuneracao" control={control}
              rules={{ required: 'A remuneração é obrigatória.' }}
              render={({ field, fieldState }) => (
                <InputNumber
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onValueChange={(e) => field.onChange(e)}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  showButtons
                  inputClassName={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('remuneracao')}
          </div>
          <div className="field">
            <label htmlFor="valeTransporte">Vale Transporte</label>
            <Controller name="valeTransporte" control={control}
              render={({ field, fieldState }) => (
                <ToggleButton
                  onLabel="Sim"
                  offLabel="Não"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  checked={field.value}
                  onChange={(e) => { field.onChange(e); }} />
              )} />
          </div>
          <div className="field">
            <label htmlFor="valeRefeicao">Vale Refeição</label>
            <Controller name="valeRefeicao" control={control}
              render={({ field, fieldState }) => (
                <ToggleButton
                  onLabel="Sim"
                  offLabel="Não"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  checked={field.value}
                  onChange={(e) => { field.onChange(e); }} />
              )} />
          </div>
          <div className="field">
            <label htmlFor="outro">Outros:</label>
            <Controller name="outro" control={control}
              render={({ field, fieldState }) => (
                <InputTextarea
                  rows={5}
                  cols={30}
                  autoResize
                  id={field.name}
                  {...field}
                  name="outro"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          <div className="field">
            <label htmlFor="turno">Turno</label>
            <Controller name="turno" control={control}
              rules={{ required: 'O turno é obrigatório.' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione um turno"
                  optionLabel='label'
                  optionValue='value'
                  filter
                  showClear
                  filterBy="value"
                  options={turno}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('turno')}
          </div>
          <div className="field">
            <label htmlFor="formaContratacao">Forma de contratação</label>
            <Controller name="formaContratacao" control={control}
              rules={{ required: 'A forma de contratação é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione uma forma de contratação"
                  optionLabel='descricao'
                  optionValue='id'
                  filter
                  showClear
                  filterBy="descricao"
                  options={formasContratacao}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('formaContratacao')}
          </div>
          <div className="field">
            <label htmlFor="uf">Unidade federativa</label>
            <Controller name="uf" control={control}
              rules={{ required: 'A uf é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione uma uf"
                  optionLabel='nome'
                  optionValue='id'
                  filter
                  showClear
                  filterBy="nome"
                  options={ufs}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('uf')}
          </div>
        </form>
      </Dialog>

      <Dialog visible={deleteVagaDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteVagaDialogFooter} onHide={hideDeleteVagaDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {vaga && <span>Você tem certeza que deseja deleta a vaga <b>{vaga.id}</b>?</span>}
        </div>
      </Dialog>

      <Dialog visible={deleteVagasDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteVagasDialogFooter} onHide={hideDeleteVagasDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {vagas && <span>Você tem certeza que deseja remover as vagas selecionadas?</span>}
        </div>
      </Dialog>
    </MainTemplate>
  );
}