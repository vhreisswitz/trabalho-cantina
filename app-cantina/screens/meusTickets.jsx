// screens/meusTickets.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { supabase } from '../services/database';
import useCantinaTickets from '../hooks/useCantinaTickets';

export default function MeusTickets({ route, navigation }) {
  const [tickets, setTickets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const { usuario } = route.params;
  const { buscarMeusTickets } = useCantinaTickets();

  const CORES_SENAI = {
    azul_principal: '#005CA9',
    azul_escuro: '#003A6B',
    azul_claro: '#E6F0FF',
    branco: '#FFFFFF',
    laranja: '#FF6B35',
    verde: '#34C759',
    vermelho: '#FF3B30',
    cinza: '#5C6B8A',
    cinza_claro: '#8E8E93'
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const carregarTickets = async () => {
    try {
      setCarregando(true);
      const meusTickets = await buscarMeusTickets(usuario.id);
      setTickets(meusTickets);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus tickets.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  const onAtualizar = () => {
    setAtualizando(true);
    carregarTickets();
  };

  const getStatusColor = (status, gratuito) => {
    if (status === 'ativo') return gratuito ? CORES_SENAI.laranja : CORES_SENAI.verde;
    if (status === 'utilizado') return CORES_SENAI.cinza_claro;
    return CORES_SENAI.vermelho;
  };

  const getStatusTexto = (status, gratuito) => {
    if (status === 'ativo') return gratuito ? 'GRATUITO' : 'PAGO';
    if (status === 'utilizado') return 'UTILIZADO';
    return 'EXPIRADO';
  };

  const getIconeStatus = (status) => {
    if (status === 'ativo') return '✅';
    if (status === 'utilizado') return '🔄';
    return '❌';
  };

  const verTicket = (ticket) => {
    navigation.navigate('TicketDigital', { ticket, usuario });
  };

  const compartilharTicket = (ticket) => {
    Alert.alert(
      'Compartilhar Ticket',
      `Código: ${ticket.ticket_code}\nProduto: ${ticket.cantina_produtos?.nome}\nStatus: ${getStatusTexto(ticket.status, ticket.gratuito)}`,
      [{ text: 'OK' }]
    );
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity 
      style={[styles.ticketCard, { backgroundColor: CORES_SENAI.branco }]}
      onPress={() => verTicket(item)}
      onLongPress={() => compartilharTicket(item)}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={[styles.produtoNome, { color: CORES_SENAI.azul_escuro }]}>
            {item.cantina_produtos?.nome || 'Produto'}
          </Text>
          <Text style={[styles.ticketCode, { color: CORES_SENAI.cinza }]}>
            {item.ticket_code}
          </Text>
          <Text style={styles.data}>
            Emitido: {new Date(item.created_at).toLocaleDateString('pt-BR')}
          </Text>
          
          {item.utilizado_em && (
            <Text style={styles.data}>
              Utilizado: {new Date(item.utilizado_em).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status, item.gratuito) }
            ]}
          >
            <Text style={styles.statusText}>
              {getIconeStatus(item.status)} {getStatusTexto(item.status, item.gratuito)}
            </Text>
          </View>
          
          {item.gratuito && item.status === 'ativo' && (
            <Text style={styles.gratuitoTag}>🎁 GRÁTIS</Text>
          )}
        </View>
      </View>

      {/* MENSAGEM ESPECIAL PARA TICKET DE BOAS-VINDAS */}
      {item.qr_data?.tipo === 'boas_vindas' && item.status === 'ativo' && (
        <View style={styles.mensagemPresente}>
          <Text style={styles.mensagemTexto}>
            🎉 Presente de boas-vindas! Use este ticket para resgatar seu {item.cantina_produtos?.nome} grátis!
          </Text>
        </View>
      )}

      <View style={styles.ticketFooter}>
        <Text style={[styles.valor, { color: CORES_SENAI.azul_principal }]}>
          {item.gratuito ? 'GRATUITO' : `R$ ${item.cantina_produtos?.preco || '0.00'}`}
        </Text>
        
        <View style={styles.acoes}>
          <TouchableOpacity 
            style={[styles.botao, styles.botaoVer]}
            onPress={() => verTicket(item)}
          >
            <Text style={styles.botaoTexto}>👀 Ver QR</Text>
          </TouchableOpacity>
          
          {item.status === 'ativo' && (
            <TouchableOpacity 
              style={[styles.botao, styles.botaoCompartilhar]}
              onPress={() => compartilharTicket(item)}
            >
              <Text style={styles.botaoTexto}>📤 Código</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (carregando) {
    return (
      <View style={[styles.container, { backgroundColor: CORES_SENAI.azul_claro }]}>
        <View style={[styles.header, { backgroundColor: CORES_SENAI.azul_principal }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.botaoVoltar}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Meus Tickets</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES_SENAI.azul_principal} />
          <Text style={[styles.loadingText, { color: CORES_SENAI.azul_escuro }]}>
            Carregando seus tickets...
          </Text>
        </View>
      </View>
    );
  }

  const ticketsAtivos = tickets.filter(t => t.status === 'ativo').length;
  const ticketsGratuitos = tickets.filter(t => t.gratuito).length;

  return (
    <View style={[styles.container, { backgroundColor: CORES_SENAI.azul_claro }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: CORES_SENAI.azul_principal }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botaoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Meus Tickets</Text>
        <View style={styles.placeholder} />
      </View>

      {/* BANNER DE BOAS-VINDAS SE TIVER TICKETS ATIVOS */}
      {ticketsAtivos > 0 && (
        <View style={[styles.bannerBoasVindas, { backgroundColor: CORES_SENAI.laranja }]}>
          <Text style={styles.bannerTexto}>
            🎁 Você tem {ticketsAtivos} ticket{ticketsAtivos > 1 ? 's' : ''} para usar!
          </Text>
        </View>
      )}

      {/* ESTATÍSTICAS */}
      <View style={[styles.estatisticas, { backgroundColor: CORES_SENAI.branco }]}>
        <View style={styles.estatisticaItem}>
          <Text style={[styles.estatisticaNumero, { color: CORES_SENAI.verde }]}>
            {ticketsAtivos}
          </Text>
          <Text style={styles.estatisticaLabel}>Ativos</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={[styles.estatisticaNumero, { color: CORES_SENAI.cinza_claro }]}>
            {tickets.filter(t => t.status === 'utilizado').length}
          </Text>
          <Text style={styles.estatisticaLabel}>Utilizados</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={[styles.estatisticaNumero, { color: CORES_SENAI.laranja }]}>
            {ticketsGratuitos}
          </Text>
          <Text style={styles.estatisticaLabel}>Gratuitos</Text>
        </View>
      </View>

      {/* LISTA DE TICKETS */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={onAtualizar}
            colors={[CORES_SENAI.azul_principal]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎫</Text>
            <Text style={styles.emptyTitle}>Nenhum ticket encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Seu ticket de boas-vindas deve aparecer aqui automaticamente ao fazer login!
            </Text>
            <TouchableOpacity 
              style={[styles.botaoHome, { backgroundColor: CORES_SENAI.azul_principal }]}
              onPress={() => navigation.navigate('Home', { usuario })}
            >
              <Text style={styles.botaoHomeTexto}>Voltar para Home</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  botaoVoltar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  bannerBoasVindas: {
    padding: 15,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estatisticaItem: {
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#5C6B8A',
    fontWeight: '500',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  ticketCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#5C6B8A',
    marginBottom: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gratuitoTag: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: 'bold',
    backgroundColor: '#FFE8E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mensagemPresente: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  mensagemTexto: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botao: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  botaoVer: {
    backgroundColor: '#005CA9',
  },
  botaoCompartilhar: {
    backgroundColor: '#5C6B8A',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C6B8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#5C6B8A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  botaoHome: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  botaoHomeTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});