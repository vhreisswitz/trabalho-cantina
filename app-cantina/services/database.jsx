import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const getTransacoesByUsuario = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transacoesMapeadas = data?.map(item => {
      let tipo = item.tipo;
      let categoria = item.categoria;
      let estabelecimento = item.estabelecimento;

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
    throw error;
  }
};

export const getEstatisticasUsuario = async (usuarioId) => {
  try {
    const { data: transacoes, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId);

    if (error) throw error;

    const estatisticas = {
      totalEntradas: 0,
      totalSaidas: 0,
      saldo: 0,
      quantidadeTransacoes: transacoes?.length || 0,
      quantidadeRecargas: 0,
      quantidadeCompras: 0
    };

    transacoes?.forEach(transacao => {
      const valor = parseFloat(transacao.valor) || 0;
      const descricaoLower = transacao.descricao?.toLowerCase() || '';

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
    throw error;
  }
};

export const addRecarga = async (usuarioId, valor, descricao = null) => {
  try {
    const descricaoFinal = descricao || `Recarga de saldo - R$ ${valor.toFixed(2)}`;

    const { data, error } = await supabase
      .from('cantina_transacoes')
      .insert([{
        usuario_id: usuarioId,
        descricao: descricaoFinal,
        valor: valor,
        tipo: 'entrada',
        categoria: 'Recarga',
        estabelecimento: 'Sistema',
        status: 'Concluído',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    await atualizarSaldoUsuario(usuarioId, valor);
    return data?.[0] || null;
  } catch (error) {
    throw error;
  }
};

export const addCompra = async (usuarioId, valor, produtoNome, estabelecimento = 'Cantina') => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .insert([{
        usuario_id: usuarioId,
        descricao: `Compra: ${produtoNome}`,
        valor: valor,
        tipo: 'saida',
        categoria: 'Alimentação',
        estabelecimento: estabelecimento,
        status: 'Concluído',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    await atualizarSaldoUsuario(usuarioId, -valor);
    return data?.[0] || null;
  } catch (error) {
    throw error;
  }
};

export const atualizarSaldoUsuario = async (usuarioId, valor) => {
  try {
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('saldo')
      .eq('id', usuarioId)
      .single();

    if (errorUsuario) throw errorUsuario;

    const saldoAtual = parseFloat(usuario.saldo) || 0;
    const novoSaldo = saldoAtual + valor;

    const { error } = await supabase
      .from('usuarios')
      .update({ saldo: novoSaldo })
      .eq('id', usuarioId);

    if (error) throw error;

    return novoSaldo;
  } catch (error) {
    throw error;
  }
};

export const getSaldoUsuario = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('saldo')
      .eq('id', usuarioId)
      .single();

    if (error) throw error;
    return parseFloat(data.saldo) || 0;
  } catch (error) {
    throw error;
  }
};

export const getTransacoesPorPeriodo = async (usuarioId, dataInicio, dataFim) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const getRecargas = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .or('tipo.eq.entrada,descricao.ilike.%recarga%,descricao.ilike.%carga%,descricao.ilike.%saldo%')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const getCompras = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_transacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .or('tipo.eq.saida,descricao.ilike.%compra%,descricao.ilike.%produto%')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const criarTicketGratis = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cantina_tickets')
      .insert({
        usuario_id: usuarioId,
        tipo: 'boas-vindas',
        valor: 0,
        status: 'disponível',
        criado_em: new Date().toISOString(),
      });
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    throw error;
  }
};

export const adminFunctions = {
  getProdutos: async () => {
    try {
      const { data, error } = await supabase
        .from('cantina_produtos')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  adicionarProduto: async (produtoData) => {
    try {
      const { data, error } = await supabase
        .from('cantina_produtos')
        .insert([{
          nome: produtoData.nome,
          preco: produtoData.preco,
          codigo: produtoData.codigo,
          descricao: produtoData.descricao,
          disponivel: produtoData.disponivel,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  atualizarProduto: async (produtoId, produtoData) => {
    try {
      const { data, error } = await supabase
        .from('cantina_produtos')
        .update({
          nome: produtoData.nome,
          preco: produtoData.preco,
          codigo: produtoData.codigo,
          descricao: produtoData.descricao,
          disponivel: produtoData.disponivel
        })
        .eq('id', produtoId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  excluirProduto: async (produtoId) => {
    try {
      const { error } = await supabase
        .from('cantina_produtos')
        .delete()
        .eq('id', produtoId);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  getUsuarios: async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  adicionarUsuario: async (usuarioData) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nome: usuarioData.nome,
          matricula: usuarioData.matricula,
          email: usuarioData.email,
          tipo: usuarioData.tipo || 'student',
          saldo: usuarioData.saldo || 0
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  atualizarUsuario: async (usuarioId, usuarioData) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nome: usuarioData.nome,
          matricula: usuarioData.matricula,
          email: usuarioData.email,
          tipo: usuarioData.tipo,
          saldo: usuarioData.saldo
        })
        .eq('id', usuarioId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  getRelatoriosVendas: async (dataInicio, dataFim) => {
    try {
      let query = supabase
        .from('cantina_transacoes')
        .select('*');

      if (dataInicio && dataFim) {
        query = query
          .gte('created_at', dataInicio)
          .lte('created_at', dataFim);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  getEstatisticasGerais: async () => {
    try {
      const { data: usuarios } = await supabase.from('usuarios').select('id');
      const { data: produtos } = await supabase.from('cantina_produtos').select('id');
      const { data: transacoes } = await supabase.from('cantina_transacoes').select('valor, tipo');

      const totalVendas = transacoes
        ?.filter(t => t.tipo === 'saida' || t.descricao?.includes('compra'))
        ?.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0) || 0;

      return {
        totalUsuarios: usuarios?.length || 0,
        totalProdutos: produtos?.length || 0,
        totalTransacoes: transacoes?.length || 0,
        totalVendas: totalVendas
      };
    } catch (error) {
      throw error;
    }
  }
}

export const verificarAdmin = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('tipo')
      .eq('id', usuarioId)
      .single();

    if (error) return false;

    const isAdmin = data?.tipo === 'admin';
    return isAdmin;
  } catch (error) {
    return false;
  }
};

export const uploadProfileImage = async (userId, imageUri) => {
  try {
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    const fileExt = filename.split('.').pop();
    const path = `profile_${userId}_${Date.now()}.${fileExt}`;
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename
    });

    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(path, formData, {
        contentType: type,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ profile_image: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    try {
      await AsyncStorage.setItem(`@local_profile_${userId}`, imageUri);
      return imageUri;
    } catch (storageError) {
      throw error;
    }
  }
};

export const deleteProfileImage = async (userId) => {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('usuarios')
      .select('profile_image')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (userData?.profile_image) {
      const url = userData.profile_image;
      const fileNameMatch = url.match(/profile-images\/([^?]+)/);
      
      if (fileNameMatch) {
        const filePath = fileNameMatch[0];
        
        const { error: deleteError } = await supabase.storage
          .from('profile-images')
          .remove([filePath]);

        if (deleteError) {
          console.warn('Não foi possível deletar do storage:', deleteError);
        }
      }
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ profile_image: null })
      .eq('id', userId);

    if (updateError) throw updateError;

    await AsyncStorage.removeItem(`@local_profile_${userId}`);

    return true;
  } catch (error) {
    throw error;
  }
};

export const getUsuarioData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const localPhoto = await AsyncStorage.getItem(`@local_profile_${userId}`);
    const profileImage = localPhoto || data.profile_image;

    return {
      ...data,
      profile_image: profileImage,
      saldo: parseFloat(data.saldo) || 0,
      tipo: data.tipo || 'student'
    };
  } catch (error) {
    throw error;
  }
};

export const updateUsuarioProfile = async (userId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};