import axios from 'axios';
import { useState, useEffect } from 'react';
import { Cidade } from '../interfaces/EmpresaInterface';
import { url } from '../service/HostApi';

export function useCidade(ufId?: string) {
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => {
    ufId === undefined ? {} : axios(`${url}/cidades/${ufId}`)
      .then(response => {
        setCidades(response.data);
      });
  }, [ufId]);

  return cidades;
}