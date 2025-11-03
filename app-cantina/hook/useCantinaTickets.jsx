// hooks/useCantinaTickets.js
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/database';

const useCantinaTickets = () => {
    const [loading, setLoading] = useState(false);

    // VERIFICAR SE USUÁRIO JÁ TEM TICKET GRATUITO PARA UM PRODUTO
    const verificarTicketGratuito = async (produtoId, usuarioId) => {
        try {
            // ✅ CORREÇÃO: Converter para string
            const usuarioIdString = usuarioId.toString();

            const { data, error } = await supabase
                .from('cantina_tickets')
                .select('id')
                .eq('produto_id', produtoId)
                .eq('usuario_id', usuarioIdString) // ✅ Usar string
                .eq('gratuito', true)
                .eq('status', 'ativo')
                .single();

            return !error && data;
        } catch (error) {
            return false;
        }
    };

    // GERAR TICKET GRATUITO (primeiro uso)
    const gerarTicketGratuito = async (produtoId, usuarioId) => {
        try {
            setLoading(true);

            // ✅ CORREÇÃO: Converter usuarioId para string
            const usuarioIdString = usuarioId.toString();

            // Verificar se já tem ticket gratuito para este produto
            const jaTemTicket = await verificarTicketGratuito(produtoId, usuarioIdString);
            if (jaTemTicket) {
                Alert.alert('Aviso', 'Você já tem um ticket gratuito para este produto!');
                return null;
            }

            // Buscar dados do produto
            const { data: produto, error: produtoError } = await supabase
                .from('cantina_produtos')
                .select('nome, preco, codigo')
                .eq('id', produtoId)
                .single();

            if (produtoError) throw produtoError;

            // Gerar código único
            const ticketCode = `TKT-GRATIS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

            // ✅ CORREÇÃO: Usar usuarioIdString
            const { data: ticket, error: ticketError } = await supabase
                .from('cantina_tickets')
                .insert([
                    {
                        produto_id: produtoId,
                        usuario_id: usuarioIdString, // ✅ Agora é string
                        ticket_code: ticketCode,
                        gratuito: true,
                        qr_data: {
                            ticketId: ticketCode,
                            produtoId: produtoId,
                            produtoNome: produto.nome,
                            produtoCodigo: produto.codigo,
                            usuarioId: usuarioIdString, // ✅ Aqui também
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
            console.error('Erro ao gerar ticket gratuito:', error);
            Alert.alert('Erro', 'Falha ao gerar ticket gratuito');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // COMPRAR TICKET (após usar o gratuito)
    const comprarTicket = async (produtoId, usuarioId, usuarioSaldo) => {
        try {
            setLoading(true);

            // ✅ CORREÇÃO: Converter para string
            const usuarioIdString = usuarioId.toString();

            const { data: produto, error: produtoError } = await supabase
                .from('cantina_produtos')
                .select('nome, preco, codigo')
                .eq('id', produtoId)
                .single();

            if (produtoError) throw produtoError;

            // ... resto do código ...

            const { data: ticket, error: ticketError } = await supabase
                .from('cantina_tickets')
                .insert([
                    {
                        produto_id: produtoId,
                        usuario_id: usuarioIdString, // ✅ Usar string
                        ticket_code: ticketCode,
                        gratuito: false,
                        qr_data: {
                            ticketId: ticketCode,
                            produtoId: produtoId,
                            produtoNome: produto.nome,
                            produtoCodigo: produto.codigo,
                            usuarioId: usuarioIdString, // ✅ Aqui também
                            dataEmissao: new Date().toISOString(),
                            valor: produto.preco,
                            tipo: 'pago'
                        }
                    }
                ])
            // ... resto do código
        } catch (error) {
            // ... tratamento de erro
        }
    };

    // UTILIZAR TICKET (Resgatar o vale)
    const utilizarTicket = async (qrData) => {
        try {
            const ticketData = JSON.parse(qrData);

            // 1. Buscar ticket
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

            // 2. Marcar como utilizado
            const { error: updateError } = await supabase
                .from('cantina_tickets')
                .update({
                    status: 'utilizado',
                    utilizado_em: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('ticket_code', ticketData.ticketId);

            if (updateError) throw updateError;

            // 3. Registrar utilização
            await supabase.from('cantina_transacoes').insert({
                usuario_id: ticket.usuario_id,
                produto_id: ticket.produto_id,
                tipo: 'uso_ticket',
                valor: 0, // Não gasta dinheiro
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

    // BUSCAR MEUS TICKETS (Vales do usuário)
    const buscarMeusTickets = async (usuarioId) => {
        try {
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
                .eq('usuario_id', usuarioId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Erro ao buscar tickets:', error);
            return [];
        }
    };

    // BUSCAR TICKETS ATIVOS (apenas os que podem ser usados)
    const buscarTicketsAtivos = async (usuarioId) => {
        try {
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
                .eq('usuario_id', usuarioId)
                .eq('status', 'ativo')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Erro ao buscar tickets ativos:', error);
            return [];
        }
    };

    return {
        loading,
        gerarTicketGratuito,
        comprarTicket,
        utilizarTicket,
        verificarTicketGratuito,
        buscarMeusTickets,
        buscarTicketsAtivos
    };
};

// hooks/useCantinaTickets.js - ADICIONE ESTA FUNÇÃO
const gerarUUIDFromId = (idNumero) => {
    // Converte o número para um UUID válido
    return `00000000-0000-0000-0000-${idNumero.toString().padStart(12, '0')}`;
};

// NA FUNÇÃO gerarTicketGratuito:
const gerarTicketGratuito = async (produtoId, usuarioId) => {
    try {
        setLoading(true);

        // ✅ CORREÇÃO: Gerar UUID válido a partir do ID numérico
        const usuarioUUID = gerarUUIDFromId(usuarioId);

        const jaTemTicket = await verificarTicketGratuito(produtoId, usuarioUUID);
        if (jaTemTicket) {
            Alert.alert('Aviso', 'Você já tem um ticket gratuito para este produto!');
            return null;
        }

        // ... resto do código ...

        const { data: ticket, error: ticketError } = await supabase
            .from('cantina_tickets')
            .insert([
                {
                    produto_id: produtoId,
                    usuario_id: usuarioUUID, // ✅ Agora é UUID válido
                    ticket_code: ticketCode,
                    gratuito: true,
                    qr_data: {
                        ticketId: ticketCode,
                        produtoId: produtoId,
                        produtoNome: produto.nome,
                        produtoCodigo: produto.codigo,
                        usuarioId: usuarioUUID, // ✅ Aqui também
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

        // ... resto do código
    } catch (error) {
        // ... tratamento de erro
    }
    // hooks/useCantinaTickets.js - ADICIONE ESTA FUNÇÃO
    const gerarUUIDFromId = (idNumero) => {
        // Converte o número para um UUID válido
        return `00000000-0000-0000-0000-${idNumero.toString().padStart(12, '0')}`;
    };

    // NA FUNÇÃO gerarTicketGratuito:
    const gerarTicketGratuito = async (produtoId, usuarioId) => {
        try {
            setLoading(true);

            // ✅ CORREÇÃO: Gerar UUID válido a partir do ID numérico
            const usuarioUUID = gerarUUIDFromId(usuarioId);

            const jaTemTicket = await verificarTicketGratuito(produtoId, usuarioUUID);
            if (jaTemTicket) {
                Alert.alert('Aviso', 'Você já tem um ticket gratuito para este produto!');
                return null;
            }

            // ... resto do código ...

            const { data: ticket, error: ticketError } = await supabase
                .from('cantina_tickets')
                .insert([
                    {
                        produto_id: produtoId,
                        usuario_id: usuarioUUID, // ✅ Agora é UUID válido
                        ticket_code: ticketCode,
                        gratuito: true,
                        qr_data: {
                            ticketId: ticketCode,
                            produtoId: produtoId,
                            produtoNome: produto.nome,
                            produtoCodigo: produto.codigo,
                            usuarioId: usuarioUUID, // ✅ Aqui também
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

            // ... resto do código
        } catch (error) {
            // ... tratamento de erro
        }
    };
};

export default useCantinaTickets;