// hooks/useCantinaTickets.js
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/database';

const useCantinaTickets = () => {
  const [loading, setLoading] = useState(false);

  // ✅ VERIFICAR E CRIAR TICKET DE BOAS-VINDAS AUTOMATICAMENTE
  const inicializarTicketBoasVindas = async (usuarioId) => {
    try {
      console.log('🎁 Verificando ticket de boas-vindas para usuário:', usuarioId.toString());

      // Buscar produtos que podem ser tickets (código P00)
      const { data: produtos, error: produtosError } = await supabase
        .from('cantina_produtos')
        .select('id, nome, preco, codigo')
        .like('codigo', 'P00%')
        .limit(1);

      if (produtosError || !produtos || produtos.length === 0) {
        console.log('🔍 Nenhum produto P00 encontrado, buscando qualquer produto...');
        // Se não achar P00, pega qualquer produto
        const { data: qualquerProduto } = await supabase
          .from('cantina_produtos')
          .select('id, nome, preco, codigo')
          .limit(1)
          .single();
        
        if (!qualquerProduto) {
          console.error('❌ Nenhum produto encontrado na loja');
          return;
        }
        produtos = [qualquerProduto];
      }

      const produtoBoasVindas = produtos[0];
      console.log('🎁 Produto para boas-vindas:', produtoBoasVindas);

      // Verificar se usuário já tem ticket de boas-vindas
      const { data: ticketExistente, error: verificaError } = await supabase
        .from('cantina_tickets')
        .select('id')
        .eq('usuario_id', usuarioId.toString())
        .eq('gratuito', true)
        .single();

      if (!verificaError && ticketExistente) {
        console.log('✅ Usuário já tem ticket de boas-vindas');
        return;
      }

      // Criar ticket de boas-vindas
      console.log('🎁 Criando ticket de boas-vindas...');
      const ticketCode = `TKT-BOASVINDAS-${usuarioId}-${Date.now()}`.toUpperCase();

      const { data: ticket, error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([
          {
            produto_id: produtoBoasVindas.id,
            usuario_id: usuarioId.toString(),
            ticket_code: ticketCode,
            gratuito: true,
            status: 'ativo',
            qr_data: {
              ticketId: ticketCode,
              produtoId: produtoBoasVindas.id,
              produtoNome: produtoBoasVindas.nome,
              produtoCodigo: produtoBoasVindas.codigo,
              usuarioId: usuarioId.toString(),
              dataEmissao: new Date().toISOString(),
              valor: 0,
              tipo: 'boas_vindas',
              mensagem: '🎉 Presente de boas-vindas!'
            }
          }
        ])
        .select(`
          *,
          cantina_produtos (
            nome,
            preco,
            codigo
          )
        `)
        .single();

      if (ticketError) {
        console.error('❌ Erro ao criar ticket de boas-vindas:', ticketError);
        return;
      }

      console.log('✅ Ticket de boas-vindas criado com SUCESSO!');
      
      // Mostrar alerta de boas-vindas
      setTimeout(() => {
        Alert.alert(
          '🎁 Presente de Boas-Vindas!',
          `Você ganhou um ${produtoBoasVindas.nome} grátis! 🎉\n\nVá em "Meus Tickets" para resgatar seu presente.`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 1500);

      return ticket;

    } catch (error) {
      console.error('❌ Erro ao inicializar ticket de boas-vindas:', error);
    }
  };

  const buscarMeusTickets = async (usuarioId) => {
    try {
      console.log('🔍 Buscando tickets para usuário:', usuarioId.toString());
      
      const { data, error } = await supabase
        .from('cantina_tickets')
        .select(`
          *,
          cantina_produtos (
            nome,
            preco,
            codigo
          )
        `)
        .eq('usuario_id', usuarioId.toString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar tickets:', error);
        throw error;
      }

      console.log('✅ Tickets encontrados:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar tickets:', error);
      return [];
    }
  };

  const gerarTicketGratuito = async (produtoId, usuarioId) => {
    try {
      setLoading(true);
      console.log('🎫 Gerando ticket gratuito...');

      const { data: produto, error: produtoError } = await supabase
        .from('cantina_produtos')
        .select('nome, preco, codigo')
        .eq('id', produtoId)
        .single();

      if (produtoError) throw produtoError;

      // Verificar se já tem ticket gratuito para ESTE produto
      const { data: ticketExistente, error: verificaError } = await supabase
        .from('cantina_tickets')
        .select('id')
        .eq('produto_id', produtoId)
        .eq('usuario_id', usuarioId.toString())
        .eq('gratuito', true)
        .eq('status', 'ativo')
        .single();

      if (!verificaError && ticketExistente) {
        Alert.alert('Aviso', 'Você já tem um ticket gratuito para este produto!');
        return null;
      }

      const ticketCode = `TKT-GRATIS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

      const { data: ticket, error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([
          {
            produto_id: produtoId,
            usuario_id: usuarioId.toString(),
            ticket_code: ticketCode,
            gratuito: true,
            status: 'ativo',
            qr_data: {
              ticketId: ticketCode,
              produtoId: produtoId,
              produtoNome: produto.nome,
              produtoCodigo: produto.codigo,
              usuarioId: usuarioId.toString(),
              dataEmissao: new Date().toISOString(),
              valor: 0,
              tipo: 'gratuito'
            }
          }
        ])
        .select(`
          *,
          cantina_produtos (
            nome,
            preco,
            codigo
          )
        `)
        .single();

      if (ticketError) throw ticketError;

      Alert.alert('🎫 Ticket Gratuito!', `Você ganhou um vale para: ${produto.nome}`);
      return ticket;

    } catch (error) {
      console.error('❌ Erro ao gerar ticket gratuito:', error);
      Alert.alert('Erro', 'Falha ao gerar ticket gratuito');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const comprarTicket = async (produtoId, usuarioId, usuarioSaldo) => {
    try {
      setLoading(true);

      const { data: produto, error: produtoError } = await supabase
        .from('cantina_produtos')
        .select('nome, preco, codigo')
        .eq('id', produtoId)
        .single();

      if (produtoError) throw produtoError;

      if (usuarioSaldo < produto.preco) {
        Alert.alert('Saldo insuficiente', `Você precisa de R$ ${produto.preco} para comprar este vale.`);
        return null;
      }

      // Atualizar saldo
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
      });

      // Gerar ticket
      const ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

      const { data: ticket, error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([
          {
            produto_id: produtoId,
            usuario_id: usuarioId.toString(),
            ticket_code: ticketCode,
            gratuito: false,
            status: 'ativo',
            qr_data: {
              ticketId: ticketCode,
              produtoId: produtoId,
              produtoNome: produto.nome,
              produtoCodigo: produto.codigo,
              usuarioId: usuarioId.toString(),
              dataEmissao: new Date().toISOString(),
              valor: produto.preco,
              tipo: 'pago'
            }
          }
        ])
        .select(`
          *,
          cantina_produtos (
            nome,
            preco,
            codigo
          )
        `)
        .single();

      if (ticketError) throw ticketError;

      Alert.alert('✅ Vale comprado!', `Você adquiriu um vale para: ${produto.nome}`);
      return { ticket, novoSaldo };

    } catch (error) {
      console.error('Erro ao comprar ticket:', error);
      Alert.alert('Erro', 'Falha ao comprar vale');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const utilizarTicket = async (qrData) => {
    try {
      const ticketData = JSON.parse(qrData);
      
      const { data: ticket, error } = await supabase
        .from('cantina_tickets')
        .select(`
          *,
          cantina_produtos (
            nome,
            codigo
          )
        `)
        .eq('ticket_code', ticketData.ticketId)
        .single();

      if (error) throw error;

      if (!ticket) {
        return { sucesso: false, mensagem: 'Vale não encontrado' };
      }

      if (ticket.status !== 'ativo') {
        return { 
          sucesso: false, 
          mensagem: ticket.status === 'utilizado' 
            ? 'Vale já utilizado' 
            : 'Vale expirado' 
        };
      }

      const { error: updateError } = await supabase
        .from('cantina_tickets')
        .update({
          status: 'utilizado',
          utilizado_em: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('ticket_code', ticketData.ticketId);

      if (updateError) throw updateError;

      await supabase.from('cantina_transacoes').insert({
        usuario_id: ticket.usuario_id,
        produto_id: ticket.produto_id,
        tipo: 'uso_ticket',
        valor: 0,
        descricao: `Uso de vale: ${ticket.cantina_produtos.nome}`,
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