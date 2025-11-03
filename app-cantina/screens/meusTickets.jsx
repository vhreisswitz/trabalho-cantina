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
    cinza: '#5C6B8A'
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

  const verTicket = (ticket) => {
    navigation.navigate('TicketDigital', { ticket, usuario });
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity 
      style={[styles.ticketCard, { backgroundColor: CORES_SENAI.branco }]}
      onPress={() => verTicket(item)}
    >
      <View style={styles.ticketHeader}>
        <Text style={[styles.produtoNome, { color: CORES_SENAI.azul_escuro }]}>
          {item.cantina_produtos?.nome || 'Produto'}
        </Text>
        <Text style={[styles.ticketCode, { color: CORES_SENAI.cinza }]}>
          {item.ticket_code}
        </Text>
      </View>

      <View style={styles.ticketInfo}>
        <Text style={styles.data}>
          Emitido: {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusBadge, 
              { 
                backgroundColor: item.status === 'ativo' 
                  ? (item.gratuito ? CORES_SENAI.laranja : CORES_SENAI.verde)
                  : CORES_SENAI.cinza
              }
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === 'ativo' ? '✅ Ativo' : '🔄 Utilizado'}
              {item.gratuito && ' • GRÁTIS'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.botaoVer, { backgroundColor: CORES_SENAI.azul_principal }]}
        onPress={() => verTicket(item)}
      >
        <Text style={styles.botaoTexto}>Ver QR Code</Text>
      </TouchableOpacity>
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
          <Text style={styles.loadingText}>Carregando seus tickets...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: CORES_SENAI.azul_claro }]}>
      <View style={[styles.header, { backgroundColor: CORES_SENAI.azul_principal }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botaoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Meus Tickets</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.estatisticas}>
        <Text style={styles.contador}>
          {tickets.filter(t => t.status === 'ativo').length} tickets ativos
        </Text>
      </View>

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
              Compre vales grátis na tela inicial para aparecerem aqui!
            </Text>
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
  estatisticas: {
    padding: 16,
    alignItems: 'center',
  },
  contador: {
    fontSize: 16,
    color: '#5C6B8A',
    fontWeight: '500',
  },
  lista: {
    padding: 16,
    paddingBottom: 20,
  },
  ticketCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: '500',
  },
  ticketInfo: {
    marginBottom: 12,
  },
  data: {
    fontSize: 12,
    color: '#5C6B8A',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  botaoVer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5C6B8A',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 48,
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
  },
});