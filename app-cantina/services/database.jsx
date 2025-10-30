import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aoknqmjavdiwfxceehvs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva25xbWphdmRpd2Z4Y2VlaHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjY4MDksImV4cCI6MjA3NjAwMjgwOX0.vABbF0FdtoqREoOAxIsxEp0358u57ItH6SwBlLguU4c";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const testarConexao = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);
    
    return { data, error };
  } catch (error) {
    return { error };
  }
};

// Função para buscar transações do usuário - AJUSTADA PARA CANTINA
export const getTransacoesByUsuario = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }

    console.log('Transações encontradas:', data);
    
    // Mapeia os dados para o formato da cantina
    const transacoesMapeadas = data?.map(item => {
      // Determina o tipo baseado na descrição ou lógica de negócio
      let tipo = item.tipo;
      let categoria = item.categoria;
      let estabelecimento = item.estabelecimento;
      
      // Se não tiver tipo definido, tenta inferir pela descrição
      if (!tipo) {
        const descricaoLower = item.descricao?.toLowerCase() || '';
        if (descricaoLower.includes('recarga') || 
            descricaoLower.includes('carga') || 
            descricaoLower.includes('depósito') ||
            descricaoLower.includes('saldo')) {
          tipo = 'entrada';
          categoria = 'Recarga';
          estabelecimento = 'Sistema';
        } else {
          tipo = 'saida';
          categoria = categoria || 'Alimentação';
          estabelecimento = estabelecimento || 'Cantina';
        }
      }
      
      return {
        id: item.id,
        usuario_id: item.usuario_id,
        produto_id: item.produto_id,
        tipo: tipo,
        valor: parseFloat(item.valor) || 0,
        descricao: item.descricao,
        data: item.created_at,
        categoria: categoria || 'Geral',
        estabelecimento: estabelecimento || 'Cantina',
        status: item.status || 'Concluído'
      };
    }) || [];

    return transacoesMapeadas;

  } catch (error) {
    console.error('Erro na função getTransacoesByUsuario:', error);
    throw error;
  }
};

// Função para buscar estatísticas do usuário - AJUSTADA
export const getEstatisticasUsuario = async (usuarioId) => {
  try {
    // Busca todas as transações do usuário
    const { data: transacoes, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }

    // Calcula estatísticas considerando a lógica da cantina
    const estatisticas = {
      totalEntradas: 0,    // Recargas
      totalSaidas: 0,      // Compras
      saldo: 0,
      quantidadeTransacoes: transacoes?.length || 0,
      quantidadeRecargas: 0,
      quantidadeCompras: 0
    };

    transacoes?.forEach(transacao => {
      const valor = parseFloat(transacao.valor) || 0;
      const descricaoLower = transacao.descricao?.toLowerCase() || '';
      
      // Lógica para determinar se é entrada (recarga) ou saída (compra)
      const isEntrada = transacao.tipo === 'entrada' || 
                       descricaoLower.includes('recarga') || 
                       descricaoLower.includes('carga') ||
                       descricaoLower.includes('depósito') ||
                       descricaoLower.includes('saldo');

      if (isEntrada) {
        estatisticas.totalEntradas += valor;
        estatisticas.quantidadeRecargas++;
      } else {
        estatisticas.totalSaidas += valor;
        estatisticas.quantidadeCompras++;
      }
    });

    estatisticas.saldo = estatisticas.totalEntradas - estatisticas.totalSaidas;

    return estatisticas;

  } catch (error) {
    console.error('Erro na função getEstatisticasUsuario:', error);
    throw error;
  }
};

// Função para adicionar uma RECARGA (entrada)
export const addRecarga = async (usuarioId, valor, descricao = null) => {
  try {
    const descricaoFinal = descricao || `Recarga de saldo - R$ ${valor.toFixed(2)}`;
    
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .insert([
        {
          usuario_id: usuarioId,
          descricao: descricaoFinal,
          valor: valor,
          tipo: 'entrada',
          categoria: 'Recarga',
          estabelecimento: 'Sistema',
          status: 'Concluído',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao adicionar recarga:', error);
      throw error;
    }

    // Atualiza o saldo do usuário
    await atualizarSaldoUsuario(usuarioId, valor);

    return data?.[0] || null;

  } catch (error) {
    console.error('Erro na função addRecarga:', error);
    throw error;
  }
};

// Função para adicionar uma COMPRA (saída)
export const addCompra = async (usuarioId, valor, produtoNome, estabelecimento = 'Cantina') => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .insert([
        {
          usuario_id: usuarioId,
          descricao: `Compra: ${produtoNome}`,
          valor: valor,
          tipo: 'saida',
          categoria: 'Alimentação',
          estabelecimento: estabelecimento,
          status: 'Concluído',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao adicionar compra:', error);
      throw error;
    }

    // Atualiza o saldo do usuário (subtrai)
    await atualizarSaldoUsuario(usuarioId, -valor);

    return data?.[0] || null;

  } catch (error) {
    console.error('Erro na função addCompra:', error);
    throw error;
  }
};

// Função para atualizar o saldo do usuário
export const atualizarSaldoUsuario = async (usuarioId, valor) => {
  try {
    // Primeiro busca o saldo atual
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('saldo')
      .eq('id', usuarioId)
      .single();

    if (errorUsuario) {
      console.error('Erro ao buscar saldo do usuário:', errorUsuario);
      throw errorUsuario;
    }

    const saldoAtual = parseFloat(usuario.saldo) || 0;
    const novoSaldo = saldoAtual + valor;

    // Atualiza o saldo
    const { error } = await supabase
      .from('usuarios')
      .update({ saldo: novoSaldo })
      .eq('id', usuarioId);

    if (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw error;
    }

    console.log(`Saldo atualizado: Usuário ${usuarioId} - De: R$ ${saldoAtual.toFixed(2)} Para: R$ ${novoSaldo.toFixed(2)}`);
    return novoSaldo;

  } catch (error) {
    console.error('Erro na função atualizarSaldoUsuario:', error);
    throw error;
  }
};

// Função para buscar o saldo atual do usuário
export const getSaldoUsuario = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('saldo')
      .eq('id', usuarioId)
      .single();

    if (error) {
      console.error('Erro ao buscar saldo:', error);
      throw error;
    }

    return parseFloat(data.saldo) || 0;

  } catch (error) {
    console.error('Erro na função getSaldoUsuario:', error);
    throw error;
  }
};

// Função para buscar transações com filtro por período
export const getTransacoesPorPeriodo = async (usuarioId, dataInicio, dataFim) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações por período:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Erro na função getTransacoesPorPeriodo:', error);
    throw error;
  }
};

// Função para buscar histórico de recargas
export const getRecargas = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .or('tipo.eq.entrada,descricao.ilike.%recarga%,descricao.ilike.%carga%,descricao.ilike.%saldo%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar recargas:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Erro na função getRecargas:', error);
    throw error;
  }
};

// Função para buscar histórico de compras
export const getCompras = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .or('tipo.eq.saida,descricao.ilike.%compra%,descricao.ilike.%produto%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar compras:', error);
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Erro na função getCompras:', error);
    throw error;
  }
};