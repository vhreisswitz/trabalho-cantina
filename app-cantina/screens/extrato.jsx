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
import { useTheme } from '../context/themeContext'; // Importe o hook

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

  // Use o contexto do tema
  const { darkMode } = useTheme();

  // Cores baseadas no tema
  const CORES = {
    fundo: darkMode ? '#000000' : '#F8F9FA',
    card: darkMode ? '#1C1C1E' : '#FFFFFF',
    texto: darkMode ? '#FFFFFF' : '#000000',
    texto_secundario: darkMode ? '#98989F' : '#8E8E93',
    borda: darkMode ? '#38383A' : '#E5E5EA',
    primaria: '#007AFF',
    entrada: '#34C759',
    saida: '#FF3B30',
    filtro_inativo: darkMode ? '#2C2C2E' : '#F2F2F7'
  };

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
    const cor = isRecarga ? CORES.entrada : CORES.saida;
    const sinal = isRecarga ? '+' : '-';
    const tipoTexto = isRecarga ? 'Recarga' : 'Compra';

    const corFundoIcone = darkMode 
      ? (isRecarga ? '#1A331A' : '#331A1A') 
      : (isRecarga ? '#E8F5E8' : '#FFEBEE');

    return (
      <TouchableOpacity 
        style={[styles.transacaoItem, { backgroundColor: CORES.card }]}
        onPress={() => abrirDetalhes(transacao)}
      >
        <View style={[styles.transacaoIcon, { backgroundColor: corFundoIcone }]}>
          <Ionicons 
            name={icone} 
            size={20} 
            color={cor} 
          />
        </View>
        <View style={styles.transacaoInfo}>
          <Text style={[styles.transacaoDescricao, { color: CORES.texto }]}>
            {transacao.descricao}
          </Text>
          <Text style={[styles.transacaoData, { color: CORES.texto_secundario }]}>
            {new Date(transacao.data).toLocaleDateString('pt-BR')} • {transacao.estabelecimento}
          </Text>
          <View style={styles.tipoContainer}>
            <Text style={[styles.tipoText, { 
              color: cor,
              backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7'
            }]}>
              {tipoTexto}
            </Text>
            <Text style={[styles.transacaoCategoria, { color: CORES.primaria }]}>
              {transacao.categoria}
            </Text>
          </View>
        </View>
        <View style={styles.transacaoValor}>
          <Text style={[styles.valorText, { color: cor }]}>
            {sinal} R$ {transacao.valor.toFixed(2)}
          </Text>
          <Text style={[styles.statusText, { color: CORES.texto_secundario }]}>
            {transacao.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Estilos dinâmicos
  const dynamicStyles = {
    container: {
      backgroundColor: CORES.fundo,
    },
    header: {
      backgroundColor: CORES.card,
      borderBottomColor: CORES.borda,
    },
    headerTitle: {
      color: CORES.texto,
    },
    resumoContainer: {
      backgroundColor: CORES.card,
    },
    resumoTitle: {
      color: CORES.texto_secundario,
    },
    saldoTotal: {
      color: CORES.texto,
    },
    resumoLabel: {
      color: CORES.texto_secundario,
    },
    listaTitle: {
      color: CORES.texto,
    },
    modalContent: {
      backgroundColor: CORES.card,
    },
    modalTitle: {
      color: CORES.texto,
    },
    detalhesLabel: {
      color: CORES.texto_secundario,
    },
    detalhesValue: {
      color: CORES.texto,
    },
    emptyStateText: {
      color: CORES.texto_secundario,
    },
    emptyStateSubtext: {
      color: CORES.texto_secundario,
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={CORES.primaria} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Extrato</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primaria} />
          <Text style={[styles.loadingText, { color: CORES.texto_secundario }]}>
            Carregando extrato...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={CORES.primaria} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Extrato</Text>
        <TouchableOpacity onPress={exportarExtrato}>
          <Ionicons name="download-outline" size={24} color={CORES.primaria} />
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={[styles.resumoContainer, dynamicStyles.resumoContainer]}>
        <Text style={[styles.resumoTitle, dynamicStyles.resumoTitle]}>Saldo Disponível</Text>
        <Text style={[styles.saldoTotal, dynamicStyles.saldoTotal]}>
          R$ {estatisticas.saldo.toFixed(2)}
        </Text>
        <View style={styles.resumoLinha}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValorEntrada}>+ R$ {estatisticas.totalEntradas.toFixed(2)}</Text>
            <Text style={[styles.resumoLabel, dynamicStyles.resumoLabel]}>
              {estatisticas.quantidadeRecargas} Recarga{estatisticas.quantidadeRecargas !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValorSaida}>- R$ {estatisticas.totalSaidas.toFixed(2)}</Text>
            <Text style={[styles.resumoLabel, dynamicStyles.resumoLabel]}>
              {estatisticas.quantidadeCompras} Compra{estatisticas.quantidadeCompras !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosContainer}>
        <TouchableOpacity 
          style={[
            styles.filtroButton, 
            { backgroundColor: filtro === 'todos' ? CORES.primaria : CORES.filtro_inativo }
          ]}
          onPress={() => setFiltro('todos')}
        >
          <Text style={[
            styles.filtroText, 
            { color: filtro === 'todos' ? '#FFFFFF' : CORES.texto_secundario }
          ]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filtroButton, 
            { backgroundColor: filtro === 'entrada' ? CORES.primaria : CORES.filtro_inativo }
          ]}
          onPress={() => setFiltro('entrada')}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={16} 
            color={filtro === 'entrada' ? '#FFFFFF' : CORES.entrada} 
            style={styles.filtroIcon}
          />
          <Text style={[
            styles.filtroText, 
            { color: filtro === 'entrada' ? '#FFFFFF' : CORES.texto_secundario }
          ]}>
            Recargas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filtroButton, 
            { backgroundColor: filtro === 'saida' ? CORES.primaria : CORES.filtro_inativo }
          ]}
          onPress={() => setFiltro('saida')}
        >
          <Ionicons 
            name="cart-outline" 
            size={16} 
            color={filtro === 'saida' ? '#FFFFFF' : CORES.saida} 
            style={styles.filtroIcon}
          />
          <Text style={[
            styles.filtroText, 
            { color: filtro === 'saida' ? '#FFFFFF' : CORES.texto_secundario }
          ]}>
            Compras
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de Transações */}
      <ScrollView 
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[CORES.primaria]}
          />
        }
      >
        <Text style={[styles.listaTitle, dynamicStyles.listaTitle]}>
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
              color={CORES.texto_secundario} 
            />
            <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>
              {filtro === 'todos' 
                ? 'Nenhuma transação encontrada' 
                : filtro === 'entrada'
                  ? 'Nenhuma recarga encontrada'
                  : 'Nenhuma compra encontrada'
              }
            </Text>
            <Text style={[styles.emptyStateSubtext, dynamicStyles.emptyStateSubtext]}>
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
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            {transacaoSelecionada && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
                    Detalhes da Transação
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={CORES.texto_secundario} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Descrição
                  </Text>
                  <Text style={[styles.detalhesValue, dynamicStyles.detalhesValue]}>
                    {transacaoSelecionada.descricao}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Valor
                  </Text>
                  <Text style={[
                    styles.detalhesValor,
                    { 
                      color: (transacaoSelecionada.tipo === 'entrada' || 
                             transacaoSelecionada.descricao?.toLowerCase().includes('recarga') ||
                             transacaoSelecionada.descricao?.toLowerCase().includes('carga') ||
                             transacaoSelecionada.descricao?.toLowerCase().includes('saldo')) 
                             ? CORES.entrada : CORES.saida 
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
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Data
                  </Text>
                  <Text style={[styles.detalhesValue, dynamicStyles.detalhesValue]}>
                    {new Date(transacaoSelecionada.data).toLocaleString('pt-BR')}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Tipo
                  </Text>
                  <Text style={[styles.detalhesValue, dynamicStyles.detalhesValue]}>
                    {(transacaoSelecionada.tipo === 'entrada' || 
                      transacaoSelecionada.descricao?.toLowerCase().includes('recarga') ||
                      transacaoSelecionada.descricao?.toLowerCase().includes('carga') ||
                      transacaoSelecionada.descricao?.toLowerCase().includes('saldo')) 
                      ? 'Recarga de Saldo' : 'Compra na Cantina'}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Categoria
                  </Text>
                  <Text style={[styles.detalhesValue, dynamicStyles.detalhesValue]}>
                    {transacaoSelecionada.categoria}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Estabelecimento
                  </Text>
                  <Text style={[styles.detalhesValue, dynamicStyles.detalhesValue]}>
                    {transacaoSelecionada.estabelecimento}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={[styles.detalhesLabel, dynamicStyles.detalhesLabel]}>
                    Status
                  </Text>
                  <Text style={[styles.detalhesValue, dynamicStyles.detalhesValue]}>
                    {transacaoSelecionada.status}
                  </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 24,
  },
  resumoContainer: {
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
    marginBottom: 8,
  },
  saldoTotal: {
    fontSize: 28,
    fontWeight: '700',
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
    marginRight: 8,
  },
  filtroIcon: {
    marginRight: 6,
  },
  filtroText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listaContainer: {
    flex: 1,
    padding: 16,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  transacaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  transacaoData: {
    fontSize: 14,
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
  },
  transacaoCategoria: {
    fontSize: 12,
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
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
  },
  detalhesValue: {
    fontSize: 16,
    fontWeight: '500',
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});