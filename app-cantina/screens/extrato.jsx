// ExtratoScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExtratoScreen({ navigation, route }) {
  const usuario = route.params?.usuario;
  const [filtro, setFiltro] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);

  const transacoes = [
    {
      id: 1,
      data: '15/12/2024 14:30',
      descricao: 'Recarga de Celular',
      valor: 50.00,
      tipo: 'entrada',
      categoria: 'Recarga',
      estabelecimento: 'App Recarga',
      status: 'Concluído'
    },
    {
      id: 2,
      data: '14/12/2024 18:45',
      descricao: 'Supermercado',
      valor: 125.80,
      tipo: 'saida',
      categoria: 'Alimentação',
      estabelecimento: 'Mercado Central',
      status: 'Concluído'
    },
    {
      id: 3,
      data: '13/12/2024 20:15',
      descricao: 'Uber',
      valor: 18.50,
      tipo: 'saida',
      categoria: 'Transporte',
      estabelecimento: 'Uber',
      status: 'Concluído'
    },
    {
      id: 4,
      data: '12/12/2024 09:30',
      descricao: 'Transferência Recebida',
      valor: 200.00,
      tipo: 'entrada',
      categoria: 'Transferência',
      estabelecimento: 'João Silva',
      status: 'Concluído'
    },
    {
      id: 5,
      data: '11/12/2024 16:20',
      descricao: 'Restaurante',
      valor: 85.00,
      tipo: 'saida',
      categoria: 'Alimentação',
      estabelecimento: 'Restaurante Sabor',
      status: 'Concluído'
    },
    {
      id: 6,
      data: '10/12/2024 11:15',
      descricao: 'Farmácia',
      valor: 45.30,
      tipo: 'saida',
      categoria: 'Saúde',
      estabelecimento: 'Drogaria Saúde',
      status: 'Concluído'
    }
  ];

  const transacoesFiltradas = filtro === 'todos' 
    ? transacoes 
    : transacoes.filter(transacao => transacao.tipo === filtro);

  const saldoTotal = transacoes.reduce((total, transacao) => {
    return transacao.tipo === 'entrada' ? total + transacao.valor : total - transacao.valor;
  }, 0);

  const abrirDetalhes = (transacao) => {
    setTransacaoSelecionada(transacao);
    setModalVisible(true);
  };

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

  const TransacaoItem = ({ transacao }) => (
    <TouchableOpacity 
      style={styles.transacaoItem}
      onPress={() => abrirDetalhes(transacao)}
    >
      <View style={styles.transacaoIcon}>
        <Ionicons 
          name={transacao.tipo === 'entrada' ? 'arrow-down' : 'arrow-up'} 
          size={20} 
          color={transacao.tipo === 'entrada' ? '#34C759' : '#FF3B30'} 
        />
      </View>
      <View style={styles.transacaoInfo}>
        <Text style={styles.transacaoDescricao}>{transacao.descricao}</Text>
        <Text style={styles.transacaoData}>{transacao.data}</Text>
        <Text style={styles.transacaoEstabelecimento}>{transacao.estabelecimento}</Text>
      </View>
      <View style={styles.transacaoValor}>
        <Text style={[
          styles.valorText,
          { color: transacao.tipo === 'entrada' ? '#34C759' : '#FF3B30' }
        ]}>
          {transacao.tipo === 'entrada' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
        </Text>
        <Text style={styles.statusText}>{transacao.status}</Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.resumoTitle}>Saldo Total</Text>
        <Text style={styles.saldoTotal}>R$ {saldoTotal.toFixed(2)}</Text>
        <View style={styles.resumoLinha}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValorEntrada}>+ R$ {
              transacoes.filter(t => t.tipo === 'entrada')
                .reduce((total, t) => total + t.valor, 0)
                .toFixed(2)
            }</Text>
            <Text style={styles.resumoLabel}>Entradas</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValorSaida}>- R$ {
              transacoes.filter(t => t.tipo === 'saida')
                .reduce((total, t) => total + t.valor, 0)
                .toFixed(2)
            }</Text>
            <Text style={styles.resumoLabel}>Saídas</Text>
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
          <Text style={[styles.filtroText, filtro === 'entrada' && styles.filtroTextAtivo]}>Entradas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filtroButton, filtro === 'saida' && styles.filtroAtivo]}
          onPress={() => setFiltro('saida')}
        >
          <Text style={[styles.filtroText, filtro === 'saida' && styles.filtroTextAtivo]}>Saídas</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de Transações */}
      <ScrollView style={styles.listaContainer}>
        <Text style={styles.listaTitle}>Últimas Transações</Text>
        {transacoesFiltradas.map(transacao => (
          <TransacaoItem key={transacao.id} transacao={transacao} />
        ))}
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
                    { color: transacaoSelecionada.tipo === 'entrada' ? '#34C759' : '#FF3B30' }
                  ]}>
                    {transacaoSelecionada.tipo === 'entrada' ? '+' : '-'} R$ {transacaoSelecionada.valor.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.detalhesItem}>
                  <Text style={styles.detalhesLabel}>Data</Text>
                  <Text style={styles.detalhesValue}>{transacaoSelecionada.data}</Text>
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
    fontSize: 14,
    color: '#8E8E93',
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filtroAtivo: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#F2F2F7',
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
  transacaoEstabelecimento: {
    fontSize: 14,
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
});