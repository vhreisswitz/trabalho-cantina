import { useState, useEffect, createContext, useContext } from 'react';
import { getSaldoUsuario } from '../services/database';

const SaldoContext = createContext();

export const useSaldo = () => {
  const context = useContext(SaldoContext);
  if (!context) {
    throw new Error('useSaldo deve ser usado dentro de um SaldoProvider');
  }
  return context;
};

export const SaldoProvider = ({ children }) => {
  const [saldo, setSaldo] = useState(0);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    if (usuarioId) {
      carregarSaldo();
    }
  }, [usuarioId]);

  const carregarSaldo = async () => {
    try {
      const saldoAtual = await getSaldoUsuario(usuarioId);
      setSaldo(saldoAtual);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    }
  };

  const atualizarSaldo = async (novoSaldo) => {
    setSaldo(novoSaldo);
  };

  const definirUsuario = (id) => {
    setUsuarioId(id);
  };

  return (
    <SaldoContext.Provider value={{
      saldo,
      atualizarSaldo,
      carregarSaldo,
      definirUsuario,
      usuarioId
    }}>
      {children}
    </SaldoContext.Provider>
  );
};