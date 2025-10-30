import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importe as funções do Supabase
import { getTransacoesByUsuario, getEstatisticasUsuario } from '../services/database';

export default function ExtratoScreen({ navigation, route }) {
  const usuario = route.params?.usuario;
  const [filtro, setFiltro] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    saldo: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    quantidadeRecargas: 0,
    quantidadeCompras: 0
  });

  // Função para buscar transações do banco
  const fetchTransacoes = async () => {
    try {
      setLoading(true);
      console.log('Buscando transações para usuário:', usuario.id);
      
      // Busca transações
      const transacoesDB = await getTransacoesByUsuario(usuario.id);
      console.log('Transações encontradas:', transacoesDB);
      
      // Busca estatísticas
      const stats = await getEstatisticasUsuario(usuario.id);
      
      setTransacoes(transacoesDB);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      Alert.alert('Erro', 'Não foi possível carregar o extrato');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Busca transações quando a tela é aberta
  useEffect(() => {
    fetchTransacoes();
  }, [usuario.id]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransacoes();
  };

  const transacoesFiltradas = filtro === 'todos' 
    ? transacoes 
    : transacoes.filter(transacao => {
        if (filtro === 'entrada') {
          return transacao.tipo === 'entrada' || 
                 transacao.descricao?.toLowerCase().includes('recarga') ||
                 transacao.descricao?.toLowerCase().includes('carga') ||
                 transacao.descricao?.toLowerCase().includes('saldo');
        } else {
          return transacao.tipo === 'saida' || 
                 !transacao.descricao?.toLowerCase().includes('recarga') &&
                 !transacao.descricao?.toLowerCase().includes('carga') &&
                 !transacao.descricao?.toLowerCase().includes('saldo');
        }
      });

  const exportarExtrato = () => {
    Alert.alert(
      "Exportar Extrato",
      "Escolha o formato:",
      [
        { text: "PDF", onPress: () => Alert.alert("PDF", "Extrato exportado em PDF") },
        { text: "Excel", onPress: () => Alert.alert("Excel", "Extrato exportado em Excel") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const abrirDetalhes = (transacao) => {
    setTransacaoSelecionada(transacao);
    setModalVisible(true);
  };

  const TransacaoItem = ({ transacao }) => {
    // Determina se é recarga (entrada) ou compra (saída)
    const isRecarga = transacao.tipo === 'entrada' || 
                     transacao.descricao?.toLowerCase().includes('recarga') ||
                     transacao.descricao?.toLowerCase().includes('carga') ||
                     transacao.descricao?.toLowerCase().includes('saldo');

    const icone = isRecarga ? 'add-circle-outline' : 'cart-outline';
    const cor = isRecarga ? '#34C759' : '#FF3B30';
    const sinal = isRecarga ? '+' : '-';
    const tipoTexto = isRecarga ? 'Recarga' : 'Compra';

    return (
      <TouchableOpacity 
        style={styles.transacaoItem}
        onPress={() => abrirDetalhes(transacao)}
      >
        <View style={[styles.transacaoIcon, { backgroundColor: isRecarga ? '#E8F5E8' : '#FFEBEE' }]}>
          <Ionicons 
            name={icone} 
            size={20} 
            color={cor} 
          />
        </View>
        <View style={styles.transacaoInfo}>
          <Text style={styles.transacaoDescricao}>{transacao.descricao}</Text>
          <Text style={styles.transacaoData}>
            {new Date(transacao.data).toLocaleDateString('pt-BR')} • {transacao.estabelecimento}
          </Text>
          <View style={styles.tipoContainer}>
            <Text style={[styles.tipoText, { color: cor }]}>{tipoTexto}</Text>
            <Text style={styles.transacaoCategoria}>{transacao.categoria}</Text>
          </View>
        </View>
        <View style={styles.transacaoValor}>
          <Text style={[styles.valorText, { color: cor }]}>
            {sinal} R$ {transacao.valor.toFixed(2)}
          </Text>
          <Text style={styles.statusText}>{transacao.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Extrato</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando extrato...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extrato</Text>
        <TouchableOpacity onPress={exportarExtrato}>
          <Ionicons name="download-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={styles.resumoContainer}>
        <Text style={styles.resumoTitle}>Saldo Disponível</Text>
        <Text style={styles.saldoTotal}>R$ {estatisticas.saldo.toFixed(2)}</Text>
        <View style={styles.resumoLinha}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValorEntrada}>+ R$ {estatisticas.totalEntradas.toFixed(2)}</Text>
            <Text style={styles.resumoLabel}>
              {estatisticas.quantidadeRecargas} Recarga{estatisticas.quantidadeRecargas !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValorSaida}>- R$ {estatisticas.totalSaidas.toFixed(2)}</Text>
            <Text style={styles.resumoLabel}>
              {estatisticas.quantidadeCompras} Compra{estatisticas.quantidadeCompras !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosContainer}>
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'todos' && styles.filtroAtivo]}
          onPress={() => setFiltro('todos')}
        >
          <Text style={[styles.filtroText, filtro === 'todos' && styles.filtroTextAtivo]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'entrada' && styles.filtroAtivo]}
          onPress={() => setFiltro('entrada')}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={16} 
            color={filtro === 'entrada' ? '#FFFFFF' : '#34C759'} 
            style={styles.filtroIcon}
          />
          <Text style={[styles.filtroText, filtro === 'entrada' && styles.filtroTextAtivo]}>Recargas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'saida' && styles.filtroAtivo]}
          onPress={() => setFiltro('saida')}
        >
          <Ionicons 
            name="cart-outline" 
            size={16} 
            color={filtro === 'saida' ? '#FFFFFF' : '#FF3B30'} 
            style={styles.filtroIcon}
          />
          <Text style={[styles.filtroText, filtro === 'saida' && styles.filtroTextAtivo]}>Compras</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de Transações */}
      <ScrollView 
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      >
        <Text style={styles.listaTitle}>
          {transacoesFiltradas.length === 0 
            ? 'Nenhuma transação' 
            : filtro === 'todos' 
              ? 'Todas as Transações' 
              : filtro === 'entrada' 
                ? 'Recargas de Saldo' 
                : 'Compras na Cantina'
          }
        </Text>
        
        {transacoesFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="document-text-outline" 
              size={64} 
              color="#C7C7CC" 
            />
            <Text style={styles.emptyStateText}>
              {filtro === 'todos' 
                ? 'Nenhuma transação encontrada' 
                : filtro === 'entrada'
                  ? 'Nenhuma recarga encontrada'
                  : 'Nenhuma compra encontrada'
              }
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {filtro === 'todos' 
                ? 'Você ainda não possui transações' 
                : filtro === 'entrada'
                  ? 'Suas recargas de saldo aparecerão aqui'
                  : 'Suas compras na cantina aparecerão aqui'
              }
            </Text>
          </View>
        ) : (
          transacoesFiltradas.map(transacao => (
            <TransacaoItem key={transacao.id} transacao={transacao} />
          ))
        )}
      </ScrollView>

      {/* Modal de Detalhes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {transacaoSelecionada && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalhes da Transação</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Descrição</Text>
                  <Text style={styles.detalhesValue}>{transacaoSelecionada.descricao}</Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Valor</Text>
                  <Text style={[
                    styles.detalhesValor,
                    { 
                      color: (transacaoSelecionada.tipo === 'entrada' || 
                             transacaoSelecionada.descricao?.toLowerCase().includes('recarga') ||
                             transacaoSelecionada.descricao?.toLowerCase().includes('carga') ||
                             transacaoSelecionada.descricao?.toLowerCase().includes('saldo')) 
                             ? '#34C759' : '#FF3B30' 
                    }
                  ]}>
                    {(transacaoSelecionada.tipo === 'entrada' || 
                      transacaoSelecionada.descricao?.toLowerCase().includes('recarga') ||
                      transacaoSelecionada.descricao?.toLowerCase().includes('carga') ||
                      transacaoSelecionada.descricao?.toLowerCase().includes('saldo')) 
                      ? '+' : '-'} R$ {transacaoSelecionada.valor.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Data</Text>
                  <Text style={styles.detalhesValue}>
                    {new Date(transacaoSelecionada.data).toLocaleString('pt-BR')}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Tipo</Text>
                  <Text style={styles.detalhesValue}>
                    {(transacaoSelecionada.tipo === 'entrada' || 
                      transacaoSelecionada.descricao?.toLowerCase().includes('recarga') ||
                      transacaoSelecionada.descricao?.toLowerCase().includes('carga') ||
                      transacaoSelecionada.descricao?.toLowerCase().includes('saldo')) 
                      ? 'Recarga de Saldo' : 'Compra na Cantina'}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Categoria</Text>
                  <Text style={styles.detalhesValue}>{transacaoSelecionada.categoria}</Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Estabelecimento</Text>
                  <Text style={styles.detalhesValue}>{transacaoSelecionada.estabelecimento}</Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Status</Text>
                  <Text style={styles.detalhesValue}>{transacaoSelecionada.status}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    width: 24,
  },
  resumoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumoTitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  saldoTotal: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoValorEntrada: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 4,
  },
  resumoValorSaida: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  resumoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filtroAtivo: {
    backgroundColor: '#007AFF',
  },
  filtroIcon: {
    marginRight: 6,
  },
  filtroText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filtroTextAtivo: {
    color: '#FFFFFF',
  },
  listaContainer: {
    flex: 1,
    padding: 16,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  transacaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transacaoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transacaoInfo: {
    flex: 1,
  },
  transacaoDescricao: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  transacaoData: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F2F2F7',
  },
  transacaoCategoria: {
    fontSize: 12,
    color: '#007AFF',
  },
  transacaoValor: {
    alignItems: 'flex-end',
  },
  valorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  detalhesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detalhesLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detalhesValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  detalhesValor: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});