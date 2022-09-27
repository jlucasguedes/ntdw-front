import { useState, Fragment, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { DataTable, DataTableGlobalFilterType } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Dropdown } from "primereact/dropdown";
import { ToggleButton } from "primereact/togglebutton";
import { MainTemplate } from '../template/MainTemplate';
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { classNames } from 'primereact/utils';
import { Candidato, CandidatoForm } from '../../interfaces/CandidatoInterface';
import { Cidade, UnidadeFederativa } from '../../interfaces/EmpresaInterface';
import dateFormat from "dateformat";

export function GerenciarCandidato() {

  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [ufs, setUfs] = useState<UnidadeFederativa[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato>();
  const [receberNoticia, setReceberNoticia] = useState<boolean | undefined>(false);
  const [candidatoDialog, setCandidatoDialog] = useState(false);
  const [deleteCandidatoDialog, setDeleteCandidatoDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<DataTableGlobalFilterType>('');
  const [sexo, setSexo] = useState<'Masculino' | 'Feminino'>();
  const tipoEnderecoSelectItems = [
    { label: 'Rural', value: 'Rural' },
    { label: 'Urbano', value: 'Urbano' },
  ];

  useEffect(() => {
    axios('https://api.jlucasguedes.com.br/ntdw/candidatos')
      .then(response => {
        setCandidatos(response.data);
      });

    axios('https://api.jlucasguedes.com.br/ntdw/ufs')
      .then(response => {
        setUfs(response.data);
      });
  }, []);

  const leftToolbarTemplate = () => {
    return (
      <Fragment>
        <Button label="Novo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
        <Button label="Remover" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedCandidato} />
      </Fragment>
    )
  }
  const openNew = () => {
    setValue('uf', undefined);
    setValue('cidade', undefined);
    setCandidatoDialog(true);
  }
  const confirmDeleteSelected = () => {
    setDeleteCandidatoDialog(true);
  }
  const hideDialog = () => {
    setCandidatoDialog(false);
    setValue('uf', undefined);
    setValue('receberNoticias', false);
    setValue('sexp', undefined);
    setSexo(undefined);
    setReceberNoticia(false);
    reset();
  }
  const hideDeleteCandidatoDialog = () => {
    setDeleteCandidatoDialog(false);
  }
  const enderecoBodyTemplate = ({ endereco }: Candidato) => {
    return `${endereco?.cep} / ${endereco?.cidade?.nome} / ${endereco?.logradouro} `;
  }

  const receberNoticiasBodyTemplate = ({ receberNoticias }: Candidato) => {
    return `${receberNoticias ? 'Sim' : 'Não'} `;
  }
  async function deleteCandidato() {
    setDeleteCandidatoDialog(false);
    await axios.delete(`https://api.jlucasguedes.com.br/ntdw/candidatos/${selectedCandidato?.id}`);
    let _candidatos = candidatos.filter(val => val.id !== selectedCandidato?.id);
    setCandidatos(_candidatos)
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato removida!', life: 3000 });
  }
  const deleteCandidatoDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCandidatoDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={deleteCandidato} />
    </Fragment>
  );
  const candidatoDialogFooter = () => {
    return (
      <div>
        <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={hideDialog} />
        <Button label="Cadastrar" icon="pi pi-check" className="p-button-success" onClick={handleSubmit(onSubmit)} />
      </div>
    );
  }
  const actionBodyTemplate = (rowData: Candidato) => {
    return (
      <Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => { editCandidato(rowData) }} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => { confirmDeleteCandidato(rowData) }} />
      </Fragment>
    );
  }
  const header = (
    <div className="table-header flex justify-between">
      <h5 className="mx-0 my-1">Gerenciar Candidatos</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Filtrar..." />
      </span>
    </div>
  );

  //Variais para usar o react-hook-form
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

  function converToJson(data: any) {
    let json = JSON.stringify(data);
    let emp = JSON.parse(json);
    return emp;
  }

  function formatDate(data: string) {
    const newData = data.substring(6, 10) + '-' + data.substring(3, 5) + '-' + data.substring(0, 2) + ' 00:00:00';
    return newData;
  }
  const editCandidato = (candidato: Candidato) => {
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
  }

  const confirmDeleteCandidato = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setDeleteCandidatoDialog(true);
  }

  const ufWatch = useWatch({
    control,
    name: 'uf'
  });
  useEffect(() => {
    ufWatch === undefined ? {} : axios(`https://api.jlucasguedes.com.br/ntdw/cidades/${ufWatch}`)
      .then(response => {
        setCidades(response.data);
      });
  }, [ufWatch])
  const getFormErrorMessage = (name: string) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  };
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
      if (data.id) {
        await axios.put(`https://api.jlucasguedes.com.br/ntdw/candidatos/${data.id}`,
          converToJson(_candidato),
        );
        hideDialog();
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato editado!', life: 3000 });
      } else {
        const response = await axios.post(`https://api.jlucasguedes.com.br/ntdw/candidatos`,
          converToJson(_candidato)
        );
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Candidato cadastrado!', life: 3000 });
        hideDialog();
        await axios(response.headers['location'])
          .then(response => {
            let _candidatos = [...candidatos, response.data]
            setCandidatos(_candidatos);
          });
      }
      axios('https://api.jlucasguedes.com.br/ntdw/candidatos')
        .then(response => {
          setCandidatos(response.data);
        });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.response.data.titulo, life: 3000 });
    }
  };


  return (
    <MainTemplate>
      <div className="datatable-crud-demo ml-3 mr-3 mt-3">
        <Toast ref={toast} />
        <div className="card">
          <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
          <DataTable
            ref={dt}
            value={candidatos}
            selection={selectedCandidato}
            onSelectionChange={(e) => setSelectedCandidato(e.value)}
            dataKey="id"
            globalFilter={globalFilter} header={header} responsiveLayout="stack">
            <Column selectionMode="single" headerStyle={{ width: '3em' }} exportable={false}></Column>
            <Column className='text-black' field="id" header="ID" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="nome" header="Nome" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="cpf" header="CPF" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' body={enderecoBodyTemplate} header="Endereço" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="sexo" header="Sexo" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="dataNascimento" header="Data de nascimento" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="email" header="E-mail" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' body={receberNoticiasBodyTemplate} header="Receber Notícias" sortable style={{ minWidth: '12rem' }}></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </div>

        <Toast ref={toast} />
        <Dialog visible={candidatoDialog}
          style={{ width: '450px' }}
          header="Cadastrar candidato"
          modal
          className="p-fluid"
          footer={candidatoDialogFooter}
          onHide={hideDialog}>
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
            </div>
            {getFormErrorMessage('nome')}
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
                        onChange={(e) => { field.onChange(e.value); }}
                        dateFormat="dd/mm/yy" mask="99/99/9999"
                        showIcon
                        value={field.value}
                        className={classNames({ 'p-invalid': fieldState.error })}
                      />
                    )} />
                )}
              />
            </div>
            {getFormErrorMessage('dataNascimento')}
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
            </div>
            {getFormErrorMessage('sexo')}
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
            </div>
            {getFormErrorMessage('cpf')}
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
            </div>
            {getFormErrorMessage('rg')}
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
            </div>
            {getFormErrorMessage('orgaoExpedidor')}
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
            </div>
            {getFormErrorMessage('dataExpedicao')}
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
            </div>
            {getFormErrorMessage('telefoneCelular')}
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
            </div>
            {getFormErrorMessage('telefoneResidencial')}
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

        <Dialog visible={deleteCandidatoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCandidatoDialogFooter} onHide={hideDeleteCandidatoDialog}>
          <div className="confirmation-content">
            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
            <span>Você tem certeza que deseja excluir o candidato <b>{selectedCandidato?.nome}</b>?</span>
          </div>
        </Dialog>
      </div>
    </MainTemplate>
  );
}