import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { adminFunctions } from '../services/database';

export default function SalesReports() {
  const navigation = useNavigation();
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');

  useEffect(() => {
    console.log('🚀 Inicializando SalesReports como admin');
    carregarRelatorios();
  }, [filtroPeriodo]);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      
      let dataInicio, dataFim;
      const hoje = new Date();
      
      switch (filtroPeriodo) {
        case 'hoje':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
          break;
        case 'semana':
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay());
          dataInicio = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate());
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
          break;
        case 'mes':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
          break;
        default:
          dataInicio = null;
          dataFim = null;
      }

      const relatoriosData = await adminFunctions.getRelatoriosVendas(
        dataInicio?.toISOString(),
        dataFim?.toISOString()
      );
      
      setRelatorios(relatoriosData);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalVendas = () => {
    return relatorios
      .filter(transacao => transacao.tipo === 'saida' || transacao.descricao?.includes('compra'))
      .reduce((total, transacao) => total + (parseFloat(transacao.valor) || 0), 0);
  };

  const calcularTotalRecargas = () => {
    return relatorios
      .filter(transacao => transacao.tipo === 'entrada' || transacao.descricao?.includes('recarga'))
      .reduce((total, transacao) => total + (parseFloat(transacao.valor) || 0), 0);
  };

  const getLabelPeriodo = () => {
    switch (filtroPeriodo) {
      case 'hoje': return 'Hoje';
      case 'semana': return 'Esta Semana';
      case 'mes': return 'Este Mês';
      case 'todos': return 'Todos';
      default: return 'Período';
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios de Vendas</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtrosContainer}>
          <Text style={styles.filtrosTitle}>Filtrar por Período:</Text>
          <View style={styles.filtrosBotoes}>
            <TouchableOpacity 
              style={[styles.filtroButton, filtroPeriodo === 'hoje' && styles.filtroButtonActive]}
              onPress={() => setFiltroPeriodo('hoje')}
            >
              <Text style={[styles.filtroButtonText, filtroPeriodo === 'hoje' && styles.filtroButtonTextActive]}>
                Hoje
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filtroButton, filtroPeriodo === 'semana' && styles.filtroButtonActive]}
              onPress={() => setFiltroPeriodo('semana')}
            >
              <Text style={[styles.filtroButtonText, filtroPeriodo === 'semana' && styles.filtroButtonTextActive]}>
                Semana
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filtroButton, filtroPeriodo === 'mes' && styles.filtroButtonActive]}
              onPress={() => setFiltroPeriodo('mes')}
            >
              <Text style={[styles.filtroButtonText, filtroPeriodo === 'mes' && styles.filtroButtonTextActive]}>
                Mês
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filtroButton, filtroPeriodo === 'todos' && styles.filtroButtonActive]}
              onPress={() => setFiltroPeriodo('todos')}
            >
              <Text style={[styles.filtroButtonText, filtroPeriodo === 'todos' && styles.filtroButtonTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitle}>Resumo - {getLabelPeriodo()}</Text>
          
          <View style={styles.resumoGrid}>
            <View style={styles.resumoCard}>
              <Text style={styles.resumoNumber}>{relatorios.length}</Text>
              <Text style={styles.resumoLabel}>Total Transações</Text>
            </View>
            
            <View style={styles.resumoCard}>
              <Text style={styles.resumoNumber}>R$ {calcularTotalVendas().toFixed(2)}</Text>
              <Text style={styles.resumoLabel}>Total Vendas</Text>
            </View>
            
            <View style={styles.resumoCard}>
              <Text style={styles.resumoNumber}>R$ {calcularTotalRecargas().toFixed(2)}</Text>
              <Text style={styles.resumoLabel}>Total Recargas</Text>
            </View>
          </View>
        </View>

        <View style={styles.listaContainer}>
          <Text style={styles.listaTitle}>Detalhes das Transações</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#005CA9" />
          ) : relatorios.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          ) : (
            <FlatList
              data={relatorios}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.transacaoItem}>
                  <View style={styles.transacaoInfo}>
                    <Text style={styles.transacaoDescricao}>{item.descricao}</Text>
                    <Text style={styles.transacaoData}>
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </Text>
                    <Text style={styles.transacaoUsuario}>
                      Usuário: {item.usuario_id}
                    </Text>
                  </View>
                  
                  <View style={styles.transacaoValorContainer}>
                    <Text style={[
                      styles.transacaoValor,
                      (item.tipo === 'entrada' || item.descricao?.includes('recarga')) 
                        ? styles.valorPositivo 
                        : styles.valorNegativo
                    ]}>
                      {(item.tipo === 'entrada' || item.descricao?.includes('recarga')) ? '+' : '-'}
                      R$ {parseFloat(item.valor).toFixed(2)}
                    </Text>
                    <Text style={styles.transacaoTipo}>
                      {item.tipo === 'entrada' ? 'Recarga' : 'Venda'}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    backgroundColor: '#005CA9',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filtrosContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtrosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 12,
  },
  filtrosBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filtroButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filtroButtonActive: {
    backgroundColor: '#005CA9',
    borderColor: '#005CA9',
  },
  filtroButtonText: {
    fontWeight: '600',
    color: '#333',
  },
  filtroButtonTextActive: {
    color: '#FFFFFF',
  },
  resumoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 16,
  },
  resumoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumoCard: {
    flex: 1,
    backgroundColor: '#E6F0FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resumoNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  listaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  transacaoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transacaoInfo: {
    flex: 1,
    marginRight: 12,
  },
  transacaoDescricao: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transacaoData: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transacaoUsuario: {
    fontSize: 11,
    color: '#999',
  },
  transacaoValorContainer: {
    alignItems: 'flex-end',
  },
  transacaoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valorPositivo: {
    color: '#28a745',
  },
  valorNegativo: {
    color: '#dc3545',
  },
  transacaoTipo: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});