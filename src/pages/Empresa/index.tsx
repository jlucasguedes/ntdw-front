import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableGlobalFilterType } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { InputMask } from 'primereact/inputmask';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Fragment, useRef, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AreaAtuacao, Cidade, UnidadeFederativa } from '../../interfaces/EmpresaInterface';
import { MainTemplate } from '../template/MainTemplate';
import { ToggleButton } from 'primereact/togglebutton';
import { tipoEnderecoSelectItems, turno } from '../../enums/EnumApi';
import { Empresa, EmpresaForm } from '../../interfaces/EmpresaInterface';
import dateFormat from "dateformat";
import { url } from '../../service/HostApi';

export function GerenciarEmpresa() {

  const [ufs, setUfs] = useState<UnidadeFederativa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [selectedEmpresas, setSelectedEmpresas] = useState<Empresa[]>([]);
  const [globalFilter, setGlobalFilter] = useState<DataTableGlobalFilterType>('');
  const [deleteEmpresaDialog, setDeleteEmpresaDialog] = useState(false);
  const [deleteEmpresasDialog, setDeleteEmpresasDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [empresaDialog, setEmpresaDialog] = useState(false);
  const [receberNoticia, setReceberNoticia] = useState<boolean | undefined>(false);
  const [sexo, setSexo] = useState<'Masculino' | 'Feminino'>();
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<AreaAtuacao[]>([]);

  const openNew = () => {
    setEmpresaDialog(true)
  }

  const hideEmpresaDialog = () => {
    setEmpresaDialog(false);
    setValue('remuneracao', 0.00);
    setValue('uf', undefined);
    setValue('formaContratacao', undefined);
    setValue('valeRefeicao', false);
    setValue('valeTransporte', false);
    reset();
  }

  const dt = useRef<DataTable>(null);
  const toast = useRef<Toast>(null);

  //Botões toolbar Nova empresa e Remover empresa
  const leftToolbarTemplate = () => {
    return (
      <Fragment>
        <Button label="Nova" icon="pi pi-plus" className="p-button-success mr-2 tablet:mb-1" onClick={openNew} />
        <Button label="Remover" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedEmpresas || !selectedEmpresas.length} />
      </Fragment>
    )
  }

  const headerDataTable = (
    <div className="table-header flex justify-between items-center tablet:items-start tablet:flex-col">
      <h5 className="mx-0 my-1">Gerenciar Empresas</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search tablet:w-full" />
        <InputText className='tablet:w-full' type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Filtrar..." />
      </span>
    </div>
  );

  /** Templates de exibição das colunas do datatable */
  const enderecoBodyTemplate = ({ endereco }: Empresa) => {
    return `${endereco?.cep} / ${endereco?.cidade?.nome} / ${endereco?.logradouro} `;
  }

  const receberNoticiasBodyTemplate = ({ receberNoticias }: Empresa) => {
    return `${receberNoticias ? 'Sim' : 'Não'} `;
  }

  const areaAtuacaoBodyTemplate = ({ areaAtuacao }: Empresa) => {
    return `${areaAtuacao?.descricao} `;
  }

  const actionBodyTemplateDataTable = (rowData: Empresa) => {
    return (
      <Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editEmpresa(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteEmpresa(rowData)} />
      </Fragment>
    );
  }
  /** Fim Templates de exibição das colunas do datatable */


  /** Dialog para deletar apenas 1 produto por vez */

  const deleteEmpresa = async () => {
    try {
      await axios.delete(`${url}/empresas/${empresa?.id}`);
      let _empresas = empresas.filter(val => val.id !== empresa?.id);
      setEmpresas(_empresas);
      setDeleteEmpresaDialog(false);
      setEmpresa(null);
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresa removida', life: 3000 });
    } catch (error: any) {
      setDeleteEmpresaDialog(false);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.response.data.titulo, life: 3000 });
    }
  }
  const hideDeleteEmpresaDialog = () => {
    setDeleteEmpresaDialog(false);
  }
  const deleteEmpresaDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={hideDeleteEmpresaDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={deleteEmpresa} />
    </Fragment>
  );
  const confirmDeleteEmpresa = (empresa: Empresa) => {
    setEmpresa(empresa);
    setDeleteEmpresaDialog(true);
  }
  /** Fim Dialog para deletar apenas 1 produto por vez */

  const deleteSelectedEmpresas = async () => {
    let ids = [...selectedEmpresas.map(v => v.id)];
    await axios.delete('${url}/empresas', { data: ids });
    let _empresas = empresas.filter(val => !selectedEmpresas.includes(val));
    setEmpresas(_empresas);
    setDeleteEmpresasDialog(false);
    setSelectedEmpresas([]);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresas removidas', life: 3000 });
  }
  /** Dialog para deletar varios ou 1 produto de uma vez */
  const confirmDeleteSelected = () => {
    setDeleteEmpresasDialog(true);
  }
  const hideDeleteEmpresasDialog = () => {
    setDeleteEmpresasDialog(false);
  }
  const deleteEmpresasDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={hideDeleteEmpresasDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedEmpresas} />
    </Fragment>
  );
  /** Fim para deletar varios ou 1 produto de uma vez */

  useEffect(() => {
    axios(`${url}/empresas`)
      .then(response => {
        setEmpresas(response.data);
        setLoading(false);
      });
  },
    []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const empresaDialogFooter = () => {
    return (
      <div>
        <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={hideEmpresaDialog} />
        <Button label="Cadastrar" icon="pi pi-check" className="p-button-success" onClick={handleSubmit(onSubmit)} />
      </div>
    );
  }

  /** Hook que valida o formulário*/
  const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm<EmpresaForm>({
    defaultValues: {
      nome: '',
      sexo: undefined,
      cpf: '',
      rg: '',
      orgaoExpedidor: '',
      dataExpedicao: undefined,
      dataNascimento: undefined,
      email: '',
      telefoneCelular: '',
      telefoneResidencial: '',
      receberNoticias: false,
      logradouro: '',
      cep: '',
      tipoEndereco: '',
      cidade: undefined,
      uf: undefined,
      areaAtuacao: undefined, //
    }
  },);

  const getFormErrorMessage = (name: string) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  };

  useEffect(() => {
    axios(`${url}/empresas`)
      .then(response => {
        setEmpresas(response.data);
      });

    axios(`${url}/ufs`)
      .then(response => {
        setUfs(response.data);
      });

    axios(`${url}/areas_atuacao`)
      .then(response => {
        setAreasAtuacao(response.data);
      });
  }, []);

  function formatDate(data: string) {
    const newData = data.substring(6, 10) + '-' + data.substring(3, 5) + '-' + data.substring(0, 2) + ' 00:00:00';
    return newData;
  }

  const editEmpresa = (empresa: Empresa) => {
    setEmpresa({ ...empresa });
    setValue('id', empresa.id);
    setValue('cnpj', empresa.cnpj);
    setValue('razaoSocial', empresa.razaoSocial);
    setValue('email', empresa.email);
    setValue('receberNoticias', empresa.receberNoticias);
    setValue('logradouro', empresa.endereco?.logradouro);
    setValue('cep', empresa.endereco?.cep);
    setValue('tipoEndereco', empresa.endereco?.tipoEndereco);
    setValue('cidade', empresa.endereco?.cidade?.id);
    setValue('uf', empresa.endereco?.cidade?.uf?.id);
    setValue('areaAtuacao', empresa.areaAtuacao?.id);
    setReceberNoticia(empresa.receberNoticias);
    setEmpresaDialog(true);
  }

  function converToJson(data: any) {
    let json = JSON.stringify(data);
    let emp = JSON.parse(json);
    return emp;
  }

  const onSubmit = async (data: EmpresaForm) => {
    let _empresa = {
      razaoSocial: data.razaoSocial,
      cnpj: data.cnpj,
      endereco: {
        logradouro: data.logradouro,
        cep: data.cep,
        tipoEndereco: data.tipoEndereco,
        cidade: {
          id: data.cidade
        }
      },
      areaAtuacao: {
        id: data.areaAtuacao
      },
      email: data.email,
      receberNoticias: receberNoticia,
    } as Empresa;
    try {
      setLoading(true);
      if (data.id) {
        await axios.put(`${url}/empresas/${data.id}`,
          converToJson(_empresa),
        );
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresa editada!', life: 3000 });
      } else {
        await axios.post(`${url}/empresas`,
          converToJson(_empresa)
        );
        hideEmpresaDialog();
        setLoading(false);
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresa criada!', life: 3000 });
      }
      await axios(`${url}/empresas`)
        .then(response => {
          setEmpresas(response.data);
          setLoading(false);
        });
      hideEmpresaDialog();
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.response.data.titulo, life: 3000 });
    }
  };
  /** Fim Hook que valida o formulário*/

  const ufWatch = useWatch({
    control,
    name: 'uf'
  });
  useEffect(() => {
    ufWatch === undefined ? {} : axios(`${url}/cidades/${ufWatch}`)
      .then(response => {
        setCidades(response.data);
      });
  }, [ufWatch])

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3">
        <Toast ref={toast} />
        <Toolbar className="mb-4 tablet:flex-wrap" left={leftToolbarTemplate} />
        <DataTable
          loading={loading}
          value={empresas}
          ref={dt}
          selection={selectedEmpresas}
          onSelectionChange={(e) => setSelectedEmpresas(e.value)}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhuma empresa encontrada"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} empresas"
          header={headerDataTable}
          globalFilter={globalFilter}
          responsiveLayout="scroll">
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
          <Column className='text-black' field="id" header="ID" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="cnpj" header="CNPJ" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="razaoSocial" header="Razão Social" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={enderecoBodyTemplate} header="Endereço" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={areaAtuacaoBodyTemplate} header="Área de atuação" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' field="email" header="E-mail" sortable style={{ minWidth: '12rem' }}></Column>
          <Column className='text-black' body={receberNoticiasBodyTemplate} header="Receber Notícias" sortable style={{ minWidth: '12rem' }}></Column>
          <Column body={actionBodyTemplateDataTable} exportable={false} style={{ minWidth: '8rem' }}></Column>
        </DataTable>
      </div>

      <Dialog visible={empresaDialog}
        style={{ width: '450px' }}
        header="Cadastrar empresa"
        modal
        className="p-fluid"
        footer={empresaDialogFooter}
        onHide={hideEmpresaDialog}>
        <form className="p-fluid flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <h5 className='font-black'>Identificação</h5>
          <div className="field">
            <label htmlFor="cnpj">CNPJ</label>
            <Controller name="cnpj" control={control}
              rules={{ required: 'O CNPJ é obrigatório' }}
              render={({ field, fieldState }) => (
                <InputMask
                  id={field.name}
                  {...field}
                  mask='99.999.999/9999-99'
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          {getFormErrorMessage('cnpj')}
          <div className="field">
            <label htmlFor="razaoSocial">Razao social</label>
            <Controller name="razaoSocial" control={control}
              rules={{ required: 'A Razão social é obrigatória!' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  name="razaoSocial"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          {getFormErrorMessage('razaoSocial')}
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'O Email é obrigatório.', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'Endereço de email inválido. Ex: example@email.com' } }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  type='email'
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )}
            />
          </div>
          {getFormErrorMessage('email')}
          <div className="field">
            <label htmlFor="areaAtuacao">Área de atuação</label>
            <Controller name="areaAtuacao" control={control}
              rules={{ required: 'Selecione uma área de atuação' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  optionLabel='descricao'
                  optionValue='id'
                  showClear
                  options={areasAtuacao}
                  className={classNames({ 'p-invalid': fieldState.error })}
                  placeholder="Selecione um tipo" />
              )} />
          </div>
          {getFormErrorMessage('areaAtuacao')}
          <h5 className='font-black'>Endereço</h5>
          <div className="field">
            <label htmlFor="cep">CEP</label>
            <Controller name="cep" control={control}
              rules={{ required: 'O CEP é obrigatório' }}
              render={({ field, fieldState }) => (
                <InputMask
                  id={field.name}
                  {...field}
                  className={classNames({ 'p-invalid': fieldState.error })}
                  mask='99.999-999' />
              )} />
          </div>
          {getFormErrorMessage('cep')}
          <div className="field">
            <label htmlFor="logradouro">Logradouro</label>
            <Controller name="logradouro" control={control}
              rules={{ required: 'O logradouro é obrigatório' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  placeholder="Logradouro"
                  {...field}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          {getFormErrorMessage('logradouro')}
          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <Controller name="uf" control={control}
              rules={{ required: 'Selecione uma UF' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione uma UF"
                  optionLabel='nome'
                  optionValue='id'
                  filter
                  showClear
                  filterBy="nome"
                  options={ufs}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          {getFormErrorMessage('uf')}
          <div className="field">
            <label htmlFor="cidade">Cidade</label>
            <Controller name="cidade" control={control}
              rules={{ required: 'Selecione uma cidade' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione uma UF primeiro"
                  optionLabel='nome'
                  optionValue='id'
                  filter
                  showClear
                  filterBy="nome"
                  options={cidades}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          {getFormErrorMessage('cidade')}
          <div className="field">
            <label htmlFor="tipoEndereco">Tipo endereço</label>
            <Controller name="tipoEndereco" control={control}
              rules={{ required: 'Selecione um tipo de endereço' }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  placeholder="Selecione um tipo de endereço"
                  optionLabel='label'
                  optionValue='value'
                  filter
                  showClear
                  filterBy="nome"
                  options={tipoEnderecoSelectItems}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
          </div>
          {getFormErrorMessage('tipoEndereco')}
          <div className="field pt-7">
            <label htmlFor="receberNoticias">Deseja receber notícias</label>
            <ToggleButton
              onLabel="Aceito"
              offLabel="Recuso"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              checked={receberNoticia}
              onChange={(e) => { setReceberNoticia(e.value); }} />
          </div>
        </form>
      </Dialog>

      <Dialog visible={deleteEmpresaDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteEmpresaDialogFooter} onHide={hideDeleteEmpresaDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {empresa && <span>Você tem certeza que deseja deleta a empresa <b>{empresa.id}</b>?</span>}
        </div>
      </Dialog>

      <Dialog visible={deleteEmpresasDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteEmpresasDialogFooter} onHide={hideDeleteEmpresasDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {empresas && <span>Você tem certeza que deseja remover as empresas selecionados?</span>}
        </div>
      </Dialog>
    </MainTemplate>
  );
}