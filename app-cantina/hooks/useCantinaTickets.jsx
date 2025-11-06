import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/database';

const useCantinaTickets = () => {
  const [loading, setLoading] = useState(false);

  // Inicializa ticket de boas-vindas para o usuário, se ainda não existir
  const inicializarTicketBoasVindas = async (usuarioId) => {
    try {
      // Buscar produto elegível para ticket de boas-vindas
      let { data: produtos, error: produtosError } = await supabase
        .from('cantina_produtos')
        .select('id, nome, preco, codigo')
        .like('codigo', 'P00%')
        .limit(1);

      if (produtosError || !produtos || produtos.length === 0) {
        // Se não achar P00*, pega qualquer produto
        const { data: qualquerProduto } = await supabase
          .from('cantina_produtos')
          .select('id, nome, preco, codigo')
          .limit(1)
          .single();
        if (!qualquerProduto) return;
        produtos = [qualquerProduto];
      }
      const produtoBoasVindas = produtos[0];

      // Verificar se usuário já tem um ticket de boas-vindas ativo
      const { data: ticketExistente } = await supabase
        .from('cantina_tickets')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('tipo', 'boas_vindas')
        .eq('status', 'ativo')
        .maybeSingle();

      if (ticketExistente) {
        // Usuário já possui um ticket de boas-vindas ativo
        return ticketExistente;
      }

      // Criar ticket de boas-vindas
      const ticketCode = `TKT-BOASVINDAS-${usuarioId}-${Date.now()}`.toUpperCase();
      const { data: ticket, error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([{
          produto_id: produtoBoasVindas.id,
          usuario_id: usuarioId,
          ticket_code: ticketCode,
          tipo: 'boas_vindas',
          gratuito: true,
          status: 'ativo',
          created_at: new Date().toISOString(),
          qr_data: JSON.stringify({
            ticketId: ticketCode,
            produtoId: produtoBoasVindas.id,
            produtoNome: produtoBoasVindas.nome,
            produtoCodigo: produtoBoasVindas.codigo,
            usuarioId: usuarioId,
            dataEmissao: new Date().toISOString(),
            valor: 0,
            tipo: 'boas_vindas',
            mensagem: '🎉 Presente de boas-vindas!'
          })
        }])
        .select()
        .single();

      if (ticketError) {
        console.error('Erro ao criar ticket de boas-vindas:', ticketError);
        return null;
      }

      setTimeout(() => {
        Alert.alert(
          '🎁 Presente de Boas-Vindas!',
          `Você ganhou um ${produtoBoasVindas.nome} grátis! 🎉\n\nVá em "Meus Tickets" para resgatar.`,
          [{ text: 'OK' }]
        );
      }, 800);

      return ticket;
    } catch (error) {
      console.error('Erro ao inicializar ticket de boas-vindas:', error);
      return null;
    }
  };

  // Retorna todos os tickets do usuário
  const buscarMeusTickets = async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('cantina_tickets')
        .select('*, cantina_produtos ( nome, preco, codigo )')
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      return [];
    }
  };

  // Cria ticket gratuito para produto se não houver existente
  async function gerarTicketGratuito(produtoId, usuarioId) {
    try {
      setLoading(true);

      // Verifica se já existe ticket gratuito disponível
      const { data: ticketExistente, error: buscaError } = await supabase
        .from('cantina_tickets')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('produto_id', produtoId)
        .eq('tipo', 'gratuito')
        .eq('status', 'ativo')
        .maybeSingle();

      if (buscaError) throw buscaError;

      if (ticketExistente) {
        Alert.alert('Já existe!', 'Você já tem um vale gratuito disponível para esse produto.');
        setLoading(false);
        return ticketExistente;
      }

      // Buscar produto
      const { data: produto, error: produtoError } = await supabase
        .from('cantina_produtos')
        .select('id, nome, preco, codigo')
        .eq('id', produtoId)
        .single();
      if (produtoError) throw produtoError;

      const ticketCode = `TKT-GRATIS-${usuarioId}-${produtoId}-${Date.now()}`.toUpperCase();

      const { data: ticket, error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([{
          produto_id: produtoId,
          usuario_id: usuarioId,
          ticket_code: ticketCode,
          tipo: 'gratuito',
          gratuito: true,
          status: 'ativo',
          created_at: new Date().toISOString(),
          qr_data: JSON.stringify({
            ticketId: ticketCode,
            produtoId: produtoId,
            produtoNome: produto.nome,
            produtoCodigo: produto.codigo,
            usuarioId: usuarioId,
            dataEmissao: new Date().toISOString(),
            valor: 0,
            tipo: 'gratuito'
          })
        }])
        .select()
        .single();

      if (ticketError) {
        throw ticketError;
      }

      Alert.alert('Vale criado!', `Seu vale gratuito para ${produto.nome} foi gerado.`);
      setLoading(false);
      return ticket;
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Falha ao gerar vale gratuito');
      console.error('Erro gerarTicketGratuito:', error);
      return null;
    }
  }

  // Compra um ticket (vale pago), descontando saldo
  const comprarTicket = async (produtoId, usuarioId, usuarioSaldo) => {
    try {
      setLoading(true);

      // Buscar produto
      const { data: produto, error: produtoError } = await supabase
        .from('cantina_produtos')
        .select('id, nome, preco, codigo')
        .eq('id', produtoId)
        .single();

      if (produtoError) throw produtoError;
      if (!produto) throw new Error('Produto não encontrado');

      if (usuarioSaldo < produto.preco) {
        Alert.alert('Saldo insuficiente', `Você precisa de R$ ${produto.preco} para comprar o vale.`);
        setLoading(false);
        return null;
      }

      // Desconta saldo
      const novoSaldo = usuarioSaldo - produto.preco;
      const { error: saldoError } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuarioId);
      if (saldoError) throw saldoError;

      // Registrar transação
      await supabase.from('cantina_transacoes').insert({
        usuario_id: usuarioId,
        produto_id: produtoId,
        tipo: 'compra_ticket',
        valor: produto.preco,
        descricao: `Compra de vale: ${produto.nome}`,
        created_at: new Date().toISOString()
      });

      // Gerar ticket pago
      const ticketCode = `TKT-PAGO-${usuarioId}-${produtoId}-${Date.now()}`.toUpperCase();

      const { data: ticket, error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([{
          produto_id: produtoId,
          usuario_id: usuarioId,
          ticket_code: ticketCode,
          tipo: 'pago',
          gratuito: false,
          status: 'ativo',
          created_at: new Date().toISOString(),
          qr_data: JSON.stringify({
            ticketId: ticketCode,
            produtoId: produtoId,
            produtoNome: produto.nome,
            produtoCodigo: produto.codigo,
            usuarioId: usuarioId,
            dataEmissao: new Date().toISOString(),
            valor: produto.preco,
            tipo: 'pago'
          })
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      Alert.alert('✅ Vale comprado!', `Você adquiriu um vale para: ${produto.nome}.`);
      setLoading(false);
      return { ticket, novoSaldo };
    } catch (error) {
      setLoading(false);
      console.error('Erro ao comprar ticket:', error);
      Alert.alert('Erro', 'Falha ao comprar vale');
      return null;
    }
  };

  // Utiliza o ticket (ex: via QR Code), marcando como utilizado
  const utilizarTicket = async (qrData) => {
    try {
      const ticketData = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
      if (!ticketData.ticketId) return { sucesso: false, mensagem: 'QR inválido' };

      // Busca o ticket pelo ticket_code
      const { data: ticket, error } = await supabase
        .from('cantina_tickets')
        .select('*, cantina_produtos ( nome, codigo )')
        .eq('ticket_code', ticketData.ticketId)
        .single();

      if (error || !ticket) {
        return { sucesso: false, mensagem: 'Vale não encontrado' };
      }

      if (ticket.status !== 'ativo') {
        let msg = 'Vale já utilizado';
        if (ticket.status === 'expirado') msg = 'Vale expirado';
        return { sucesso: false, mensagem: msg };
      }

      // Atualiza ticket como utilizado
      const { error: updateError } = await supabase
        .from('cantina_tickets')
        .update({
          status: 'utilizado',
          utilizado_em: new Date().toISOString()
        })
        .eq('ticket_code', ticketData.ticketId);

      if (updateError) throw updateError;

      // Registra uso na transação
      await supabase.from('cantina_transacoes').insert({
        usuario_id: ticket.usuario_id,
        produto_id: ticket.produto_id,
        tipo: 'uso_ticket',
        valor: 0,
        descricao: `Uso de vale: ${ticket.cantina_produtos.nome}`,
        created_at: new Date().toISOString()
      });

      return {
        sucesso: true,
        mensagem: `Vale utilizado! Produto: ${ticket.cantina_produtos.nome}`,
        dados: ticket
      };

    } catch (error) {
      console.error('Erro ao utilizar ticket:', error);
      return { sucesso: false, mensagem: 'Erro ao utilizar vale' };
    }
  };

  return {
    loading,
    gerarTicketGratuito,
    comprarTicket,
    utilizarTicket,
    buscarMeusTickets,
    inicializarTicketBoasVindas
  };
};

export default useCantinaTickets;