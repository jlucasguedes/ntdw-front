import { useState, Fragment, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { DataTable, DataTableGlobalFilterType } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from "primereact/dropdown";
import { ToggleButton } from "primereact/togglebutton";
import { MainTemplate } from '../template/MainTemplate';
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { AreaAtuacao, Cidade, UnidadeFederativa, Empresa, EmpresaForm } from '../../interfaces/EmpresaInterface';
import { classNames } from 'primereact/utils';

export function CadastroEmpresa() {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [ufs, setUfs] = useState<UnidadeFederativa[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<AreaAtuacao[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa>();
  const [receberNoticia, setReceberNoticia] = useState<boolean | undefined>(false);
  const [empresaDialog, setEmpresaDialog] = useState(false);
  const [deleteEmpresaDialog, setDeleteEmpresaDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<DataTableGlobalFilterType>('');
  const tipoEnderecoSelectItems = [
    { label: 'Rural', value: 'Rural' },
    { label: 'Urbano', value: 'Urbano' },
  ];

  useEffect(() => {
    axios('http://localhost:8080/empresas')
      .then(response => {
        setEmpresas(response.data);
      });

    axios('http://localhost:8080/ufs')
      .then(response => {
        setUfs(response.data);
      });

    axios('http://localhost:8080/areas_atuacao')
      .then(response => {
        setAreasAtuacao(response.data);
      });
  }, []);

  const leftToolbarTemplate = () => {
    return (
      <Fragment>
        <Button label="Nova" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
        <Button label="Remover" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedEmpresa} />
      </Fragment>
    )
  }
  const openNew = () => {
    setValue('uf', undefined);
    setValue('cidade', undefined);
    setValue('areaAtuacao', undefined);
    setEmpresaDialog(true);
  }
  const confirmDeleteSelected = () => {
    setDeleteEmpresaDialog(true);
  }
  const hideDialog = () => {
    setEmpresaDialog(false);
    setValue('uf', undefined);
    setValue('receberNoticias', false);
    setReceberNoticia(false);
    reset();
  }
  const hideDeleteEmpresaDialog = () => {
    setDeleteEmpresaDialog(false);
  }
  const enderecoBodyTemplate = ({ endereco }: Empresa) => {
    return `${endereco?.cep} / ${endereco?.cidade?.nome} / ${endereco?.logradouro} `;
  }
  const areaAtuacaoBodyTemplate = ({ areaAtuacao }: Empresa) => {
    return `${areaAtuacao?.descricao} `;
  }
  const receberNoticiasBodyTemplate = ({ receberNoticias }: Empresa) => {
    return `${receberNoticias ? 'Sim' : 'Não'} `;
  }
  async function deleteEmpresa() {
    setDeleteEmpresaDialog(false);
    await axios.delete(`http://localhost:8080/empresas/${selectedEmpresa?.id}`);
    let _empresas = empresas.filter(val => val.id !== selectedEmpresa?.id);
    setEmpresas(_empresas)
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresa removida!', life: 3000 });
  }
  const deleteEmpresaDialogFooter = (
    <Fragment>
      <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={hideDeleteEmpresaDialog} />
      <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={deleteEmpresa} />
    </Fragment>
  );
  const empresaDialogFooter = () => {
    return (
      <div>
        <Button label="Cancel" icon="pi pi-times" className="p-button-danger" onClick={hideDialog} />
        <Button label="Save" icon="pi pi-check" className="p-button-success" onClick={handleSubmit(onSubmit)} />
      </div>
    );
  }
  const actionBodyTemplate = (rowData: Empresa) => {
    return (
      <Fragment>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => { editEmpresa(rowData) }} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => { confirmDeleteEmpresa(rowData) }} />
      </Fragment>
    );
  }
  const header = (
    <div className="table-header flex justify-between">
      <h5 className="mx-0 my-1">Gerenciar Empresas</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Filtrar..." />
      </span>
    </div>
  );

  //Variais para usar o react-hook-form
  const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm<EmpresaForm>({
    defaultValues: {
      id: undefined,
      cnpj: '',
      razaoSocial: '',
      email: '',
      receberNoticias: false,
      logradouro: '',
      cep: '',
      tipoEndereco: '',
      cidade: undefined,
      uf: undefined,
      areaAtuacao: undefined,
    }
  },);

  function converToJson(data: any) {
    let json = JSON.stringify(data);
    let emp = JSON.parse(json);
    return emp;
  }
  const editEmpresa = (empresa: Empresa) => {
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

  const confirmDeleteEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setDeleteEmpresaDialog(true);
  }

  const ufWatch = useWatch({
    control,
    name: 'uf'
  });
  useEffect(() => {
    ufWatch === undefined ? {} : axios(`http://localhost:8080/cidades/${ufWatch}`)
      .then(response => {
        setCidades(response.data);
      });
  }, [ufWatch])
  const getFormErrorMessage = (name: string) => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>
  };
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
      if (data.id) {
        await axios.put(`http://localhost:8080/empresas/${data.id}`,
          converToJson(_empresa),
        );
        hideDialog();
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresa editada!', life: 3000 });
      } else {
        const response = await axios.post(`http://localhost:8080/empresas`,
          converToJson(_empresa)
        );
        toast?.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Empresa criada!', life: 3000 });
        hideDialog();
        await axios(response.headers['location'])
          .then(response => {
            let _empresas = [...empresas, response.data]
            setEmpresas(_empresas);
          });
      }
      axios('http://localhost:8080/empresas')
        .then(response => {
          setEmpresas(response.data);
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
            value={empresas}
            selection={selectedEmpresa}
            onSelectionChange={(e) => setSelectedEmpresa(e.value)}
            dataKey="id"
            globalFilter={globalFilter} header={header} responsiveLayout="stack">
            <Column selectionMode="single" headerStyle={{ width: '3em' }} exportable={false}></Column>
            <Column className='text-black' field="id" header="ID" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="cnpj" header="CNPJ" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="razaoSocial" header="Razão Social" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' body={enderecoBodyTemplate} header="Endereço" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' body={areaAtuacaoBodyTemplate} header="Área de atuação" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' field="email" header="E-mail" sortable style={{ minWidth: '12rem' }}></Column>
            <Column className='text-black' body={receberNoticiasBodyTemplate} header="Receber Notícias" sortable style={{ minWidth: '12rem' }}></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </div>

        <Toast ref={toast} />
        <Dialog visible={empresaDialog}
          style={{ width: '450px' }}
          header="Cadastrar empresa"
          modal
          className="p-fluid"
          footer={empresaDialogFooter}
          onHide={hideDialog}>
          <form className="p-fluid" onSubmit={handleSubmit(onSubmit)}>
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
          <div className="confirmation-content">
            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
            <span>Você tem certeza que deseja excluir a empresa <b>{selectedEmpresa?.razaoSocial}</b>?</span>
          </div>
        </Dialog>
      </div>
    </MainTemplate>
  );
}