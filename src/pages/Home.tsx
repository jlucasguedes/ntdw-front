import { Button } from 'primereact/button';
import { FormEvent, Fragment, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { MainTemplate } from './template/MainTemplate';

export function Home() {

  return (
    <MainTemplate>
      <div className="h-full w-full flex justify-center items-center">
        <Card className='shadow mt-20' title="Projeto Disciplina NTDW" style={{ width: '25rem', marginBottom: '2em' }}>
          <p className="m-0" style={{ lineHeight: '1.5' }}>
            Domínio da Aplicação: Sistema de Controle de vagas de trabalho, modulo candidato
            e modulo empresa.
          </p>
        </Card>
      </div>
    </MainTemplate >
  )
}