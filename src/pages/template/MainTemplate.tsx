import { Sidebar } from 'primereact/sidebar';
import { Toolbar } from 'primereact/toolbar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';

import { useState, Fragment, ReactNode, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empresa } from '../../interfaces/EmpresaInterface';
import { InputText } from 'primereact/inputtext';

type MainTemplateProps = {
  children?: ReactNode;
}

export function MainTemplate(props: MainTemplateProps) {
  const leftContents = (
    <Fragment>
      <a href="/"><img className='w-20' src='logo.svg' alt="Logo NTDW" /></a>
    </Fragment>
  );
  const rightContents = (
    <Fragment >
      <Button
        onClick={(e) => setVisibleSidebar(!visibleSidebar)}
        icon="pi pi-bars"
        className="p-button-rounded p-button-text"
        aria-label="Submit" />
    </Fragment>
  );

  let items = [
    {
      label: 'Empresa',
      icon: 'pi pi-fw pi-building',
      command: () => { navigate('/empresas'); },
    },
    {
      label: 'Candidato',
      icon: 'pi pi-users',
      command: () => { navigate('/candidatos'); },
    },
    {
      label: 'Vagas',
      icon: 'pi pi-list',
      command: () => { navigate('/vagas'); },
    },
    // {
    //   label: 'Inscrições',
    //   icon: 'pi pi-list',
    //   command: () => { navigate('/inscricoes'); },
    // }
  ];

  let navigate = useNavigate();
  const [visibleSidebar, setVisibleSidebar] = useState(false);

  return (
    <div className='w-screen h-screen bg-slate-800'>
      <header>
        {/* <Toolbar left={leftContents} right={rightContents} /> */}
        <Menubar
          model={items}
          start={<a href="/"><img className='w-20' src='logo.svg' alt="Logo NTDW" /></a>} />
      </header>
      <main>
        <Sidebar
          baseZIndex={9999}
          modal={false}
          visible={visibleSidebar}
          onHide={() => setVisibleSidebar(false)}>
          <Menu model={items} />
        </Sidebar>
        {props.children}
      </main >
    </div >
  )
}