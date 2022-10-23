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
import { addLocale } from 'primereact/api';
import { classNames } from 'primereact/utils';
import { Fragment, useRef, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Cidade, UnidadeFederativa } from '../../../interfaces/EmpresaInterface';
import { MainTemplate } from '../../template/MainTemplate';
import { ToggleButton } from 'primereact/togglebutton';
import { tipoEnderecoSelectItems, turno } from '../../../enums/EnumApi';
import { Candidato, CandidatoForm } from '../../../interfaces/CandidatoInterface';
import dateFormat from "dateformat";
import { url } from '../../../service/HostApi';
import { useCidade } from '../../../hooks/useCidade';

export function FormExperienciaProfissional() {

  addLocale('pt', {
    "startsWith": "Começa com",
    "contains": "Contém",
    "notContains": "Não contém",
    "endsWith": "Termina com",
    "equals": "Igual",
    "notEquals": "Diferente",
    "noFilter": "Sem filtro",
    "lt": "Menor que",
    "lte": "Menor que ou igual a",
    "gt": "Maior que",
    "gte": "Maior que ou igual a",
    "dateIs": "Data é",
    "dateIsNot": "Data não é",
    "dateBefore": "Date é anterior",
    "dateAfter": "Data é posterior",
    "custom": "Customizado",
    "clear": "Limpar",
    "apply": "Aplicar",
    "matchAll": "Match All",
    "matchAny": "Match Any",
    "addRule": "Adicionar Regra",
    "removeRule": "Remover Regra",
    "accept": "Sim",
    "reject": "Não",
    "choose": "Escolha",
    "upload": "Upload",
    "cancel": "Cancelar",
    "dayNames": ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
    "dayNamesShort": ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
    "dayNamesMin": ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sa"],
    "monthNames": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    "monthNamesShort": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    "today": "Hoje",
    "weekHeader": "Sem",
    "firstDayOfWeek": 0,
    "dateFormat": "dd/mm/yy",
    "weak": "Fraco",
    "medium": "Médio",
    "strong": "Forte",
    "passwordPrompt": "Digite uma senha",
    "emptyFilterMessage": "Sem opções disponíveis",
    "emptyMessage": "Sem resultados",
    "aria": {
      "trueLabel": "True",
      "falseLabel": "False",
      "nullLabel": "Não selecionado",
      "pageLabel": "Página",
      "firstPageLabel": "Primeira Página",
      "lastPageLabel": "Última Página",
      "nextPageLabel": "Próxima",
      "previousPageLabel": "Anterior"
    }
  }
  );

  const [ufs, setUfs] = useState<UnidadeFederativa[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [selectedCandidatos, setSelectedCandidatos] = useState<Candidato[]>([]);
  const [globalFilter, setGlobalFilter] = useState<DataTableGlobalFilterType>('');
  const [loading, setLoading] = useState(false);
  const [deleteCandidatoDialog, setDeleteCandidatoDialog] = useState(false);
  const [deleteCandidatosDialog, setDeleteCandidatosDialog] = useState(false);
  const [candidatoDialog, setCandidatoDialog] = useState(false);
  const [receberNoticia, setReceberNoticia] = useState<boolean | undefined>(false);
  const [sexo, setSexo] = useState<'Masculino' | 'Feminino'>();
  // const [cidades, setCidades] = useState<Cidade[]>([]);


  const openNew = () => {
    setCandidatoDialog(true)
  }

  const hideCandidatoDialog = () => {
    setCandidatoDialog(false);
    setValue('remuneracao', 0.00);
    setValue('uf', undefined);
    setValue('formaContratacao', undefined);
    setValue('valeRefeicao', false);
    setValue('valeTransporte', false);
    reset();
  }

  const dt = useRef<DataTable>(null);
  const toast = useRef<Toast>(null);

  //Botões toolbar Nova candidato e Remover candidato
  const leftToolbarTemplate = () => {
    return (
      <Fragment>
        <Button label="Nova" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
        <Button label="Remover" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedCandidatos || !selectedCandidatos.length} />
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

  /** Templates de exibição das colunas do datatable */
  const enderecoBodyTemplate = ({ endereco }: Candidato) => {
    return `${endereco?.cep} / ${endereco?.cidade?.nome} / ${endereco?.logradouro} `;
  }

  const receberNoticiasBodyTemplate = ({ receberNoticias }: Candidato) => {
    return `${receberNoticias ? 'Sim' : 'Não'} `;
  }

  const actionBodyTemplateDataTable = (rowData: Candidato) => {
    return (
      <Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCandidato(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteCandidato(rowData)} />
      </Fragment>
    );
  }
  /** Fim Templates de exibição das colunas do datatable */


  /** Dialog para deletar apenas 1 candidato por vez */

  const deleteProduct = async () => {
    await axios.delete(`${url}/candidatos/${candidato?.id}`);
    let _candidatos = candidatos.filter(val => val.id !== candidato?.id);
    setCandidatos(_candidatos);
    setDeleteCandidatoDialog(false);
    setCandidato(null);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato removido', life: 3000 });
  }
  const hideDeleteCandidatoDialog = () => {
    setDeleteCandidatoDialog(false);
  }
  const deleteCandidatoDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDeleteCandidatoDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-outlined p-button-success" onClick={deleteProduct} />
    </Fragment>
  );
  const confirmDeleteCandidato = (candidato: Candidato) => {
    setCandidato(candidato);
    setDeleteCandidatoDialog(true);
  }
  /** Fim Dialog para deletar apenas 1 produto por vez */

  const deleteSelectedCandidatos = async () => {
    let ids = [...selectedCandidatos.map(v => v.id)];
    await axios.delete(`${url}/candidatos`, { data: ids });
    let _candidatos = candidatos.filter(val => !selectedCandidatos.includes(val));
    setCandidatos(_candidatos);
    setDeleteCandidatosDialog(false);
    setSelectedCandidatos([]);
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidatos removidos', life: 3000 });
  }
  /** Dialog para deletar varios ou 1 produto de uma vez */
  const confirmDeleteSelected = () => {
    setDeleteCandidatosDialog(true);
  }
  const hideDeleteCandidatosDialog = () => {
    setDeleteCandidatosDialog(false);
  }
  const deleteCandidatosDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDeleteCandidatosDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-outlined p-button-success" onClick={deleteSelectedCandidatos} />
    </Fragment>
  );
  /** Fim para deletar varios ou 1 produto de uma vez */

  useEffect(() => {
    axios(`${url}/candidatos`)
      .then(response => {
        setCandidatos(response.data);
        setLoading(false);
      });
  },
    []);

  const candidatoDialogFooter = () => {
    return (
      <div>
        <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={hideCandidatoDialog} />
        <Button label="Cadastrar" icon="pi pi-check" className="p-button-success" onClick={handleSubmit(onSubmit)} />
      </div>
    );
  }

  /** Hook que valida o formulário*/
  const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm<CandidatoForm>({
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
    }
  },);

  const getFormErrorMessage = (name: string) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  };

  useEffect(() => {
    axios(`${url}/candidatos`)
      .then(response => {
        setCandidatos(response.data);
      });

    axios(`${url}/ufs`)
      .then(response => {
        setUfs(response.data);
      });
  }, []);

  function formatDate(data: string) {
    const newData = data.substring(6, 10) + '-' + data.substring(3, 5) + '-' + data.substring(0, 2) + ' 00:00:00';
    return newData;
  }

  const editCandidato = (candidato: Candidato) => {
    setCandidato({ ...candidato });
    setValue('id', candidato.id);
    setValue('nome', candidato.nome);
    setValue('sexo', candidato.sexo);
    setValue('cpf', candidato.cpf);
    setValue('rg', candidato.rg);
    setValue('orgaoExpedidor', candidato.orgaoExpedidor);
    setValue('dataExpedicao', new Date(formatDate(candidato.dataExpedicao)));
    setValue('dataNascimento', new Date(formatDate(candidato.dataNascimento)));
    setValue('email', candidato.email);
    setValue('telefoneCelular', candidato.telefoneCelular);
    setValue('telefoneResidencial', candidato.telefoneResidencial);
    setValue('receberNoticias', candidato.receberNoticias);
    setValue('logradouro', candidato.endereco.logradouro);
    setValue('cep', candidato.endereco.cep);
    setValue('tipoEndereco', candidato.endereco.tipoEndereco);
    setValue('cidade', candidato.endereco.cidade?.id);
    setValue('uf', candidato.endereco.cidade?.uf?.id);
    setReceberNoticia(candidato.receberNoticias);
    setSexo(candidato.sexo);
    setCandidatoDialog(true);
    setCandidatoDialog(true);
  }

  function converToJson(data: any) {
    let json = JSON.stringify(data);
    let emp = JSON.parse(json);
    return emp;
  }

  const onSubmit = async (data: CandidatoForm) => {
    let _candidato = {
      nome: data.nome,
      sexo: data.sexo,
      cpf: data.cpf,
      rg: data.rg,
      orgaoExpedidor: data.orgaoExpedidor,
      dataExpedicao: dateFormat(data.dataExpedicao, 'dd/mm/yyyy'),
      dataNascimento: dateFormat(data.dataNascimento, 'dd/mm/yyyy'),
      email: data.email,
      telefoneCelular: data.telefoneCelular,
      telefoneResidencial: data.telefoneResidencial,
      receberNoticias: receberNoticia,
      endereco: {
        logradouro: data.logradouro,
        cep: data.cep,
        tipoEndereco: data.tipoEndereco,
        cidade: {
          id: data.cidade
        }
      },
    } as Candidato;
    try {
      setLoading(true);
      if (data.id) {
        await axios.put(`${url}/candidatos/${data.id}`,
          converToJson(_candidato),
        );
        hideCandidatoDialog();
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato editado!', life: 3000 });
      } else {
        await axios.post(`${url}/candidatos`,
          converToJson(_candidato)
        );
        hideCandidatoDialog();
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato cadastrado!', life: 3000 });
      }
      axios(`${url}/candidatos`)
        .then(response => {
          setCandidatos(response.data);
        });
      setLoading(false);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.response.data.titulo, life: 3000 });
    }
  };
  /** Fim Hook que valida o formulário*/


  const ufWatch = useWatch({
    control,
    name: 'uf'
  });

  const cidades = useCidade(ufWatch?.toString());

  // useEffect(() => {
  //   ufWatch === undefined ? {} : axios(`${url}/cidades/${ufWatch}`)
  //     .then(response => {
  //       setCidades(response.data);
  //     });
  // }, [ufWatch])

  return (
    <MainTemplate>
      <div className="ml-3 mr-3 mt-3">
        <Toolbar className="mb-4" left={leftToolbarTemplate} />

        <DataTable
          loading={loading}
          value={candidatos}
          ref={dt}
          selection={selectedCandidatos}
          onSelectionChange={(e) => setSelectedCandidatos(e.value)}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="Nenhum candidato encontrado"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Exibindo {first} de {last} de {totalRecords} candidatos"
          header={headerDataTable}
          globalFilter={globalFilter}
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

      <Dialog visible={candidatoDialog}
        style={{ width: '450px' }}
        header="Cadastrar candidato"
        modal
        className="p-fluid"
        footer={candidatoDialogFooter}
        onHide={hideCandidatoDialog}>
        <form className="p-fluid flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <h5 className='font-black'>Identificação</h5>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <Controller name="nome" control={control}
              rules={{ required: 'O Nome é obrigatório!' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  name="nome"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('nome')}
          </div>
          <div className="field">
            <label htmlFor="dataNascimento">Data de nascimento</label>
            <Controller
              name="dataNascimento"
              control={control}
              rules={{ required: 'A data de nascimento é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Controller
                  name="dataNascimento"
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
            {getFormErrorMessage('dataNascimento')}
          </div>
          <div className="field">
            <label htmlFor="sexo">Sexo</label>
            <Controller name="sexo" control={control} rules={{ required: true }} render={({ field, fieldState }) => (
              <div className='flex gap-1'>
                <RadioButton
                  inputId='femi'
                  name='sexo'
                  onChange={(e) => { field.onChange('Feminino'); setSexo('Feminino'); }}
                  checked={sexo === 'Feminino'}
                  className={classNames({ 'p-invalid': fieldState.error })} />
                <label htmlFor="femi">Feminino</label>
                <RadioButton
                  inputId='masc'
                  name='sexo'
                  onChange={(e) => { field.onChange('Masculino'); setSexo('Masculino'); }}
                  checked={sexo === 'Masculino'}
                  className={classNames({ 'p-invalid': fieldState.error })} />
                <label htmlFor="masc">Masculino</label>
              </div>
            )} />
            {getFormErrorMessage('sexo')}
          </div>
          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <Controller name="cpf" control={control}
              rules={{ required: 'O CPF é obrigatório!' }}
              render={({ field, fieldState }) => (
                <InputMask
                  mask="999.999.999-99"
                  id={field.name}
                  {...field}
                  name="cpf"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('cpf')}
          </div>
          <div className="field">
            <label htmlFor="rg">RG</label>
            <Controller
              name="rg"
              control={control}
              rules={{ required: 'O RG é obrigatório.' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  type='number'
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )}
            />
            {getFormErrorMessage('rg')}
          </div>
          <div className="field">
            <label htmlFor="orgaoExpedidor">Orgão expedidor</label>
            <Controller
              name="orgaoExpedidor"
              control={control}
              rules={{ required: 'O Orgão expedidor é obrigatório.' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )}
            />
            {getFormErrorMessage('orgaoExpedidor')}
          </div>
          <div className="field">
            <label htmlFor="dataExpedicao">Data de expedição</label>
            <Controller
              name="dataExpedicao"
              control={control}
              rules={{ required: 'A data de expedição é obrigatória.' }}
              render={({ field, fieldState }) => (
                <Controller
                  name="dataExpedicao"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      locale='pt'
                      id={field.name}
                      onChange={(e) => { field.onChange(e.value); }}
                      value={field.value}
                      dateFormat="dd/mm/yy" mask="99/99/9999"
                      showIcon
                      className={classNames({ 'p-invalid': fieldState.error })}
                    />
                  )} />
              )}
            />
            {getFormErrorMessage('dataExpedicao')}
          </div>
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
            {getFormErrorMessage('email')}
          </div>
          <div className="field">
            <label htmlFor="telefoneCelular">Telefone celular</label>
            <Controller name="telefoneCelular" control={control}
              rules={{ required: 'O Telefone celular é obrigatório!' }}
              render={({ field, fieldState }) => (
                <InputMask
                  mask="(99) 99999-9999"
                  id={field.name}
                  {...field}
                  name="telefoneCelular"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('telefoneCelular')}
          </div>
          <div className="field">
            <label htmlFor="telefoneResidencial">Telefone residencial</label>
            <Controller name="telefoneResidencial" control={control}
              rules={{ required: 'O Telefone residencial é obrigatório!' }}
              render={({ field, fieldState }) => (
                <InputMask
                  mask="(99) 9999-9999"
                  id={field.name}
                  {...field}
                  name="telefoneResidencial"
                  className={classNames({ 'p-invalid': fieldState.error })} />
              )} />
            {getFormErrorMessage('telefoneResidencial')}
          </div>
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
            {getFormErrorMessage('cep')}
          </div>
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
            {getFormErrorMessage('logradouro')}
          </div>
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
            {getFormErrorMessage('uf')}
          </div>
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
            {getFormErrorMessage('cidade')}
          </div>
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
            {getFormErrorMessage('tipoEndereco')}
          </div>
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

      <Dialog visible={deleteCandidatoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCandidatoDialogFooter} onHide={hideDeleteCandidatoDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {candidato && <span>Você tem certeza que deseja deleta a candidato <b>{candidato.id}</b>?</span>}
        </div>
      </Dialog>

      <Dialog visible={deleteCandidatosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCandidatosDialogFooter} onHide={hideDeleteCandidatosDialog}>
        <div className="confirmation-content flex items-center justify-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {candidatos && <span>Você tem certeza que deseja remover as candidatos selecionados?</span>}
        </div>
      </Dialog>
    </MainTemplate>
  );
}