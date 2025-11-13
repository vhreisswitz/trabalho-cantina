import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/database';
import { useTheme } from '../context/themeContext'; // Importe o hook

export default function Carrinho({ route, navigation }) {
  const { usuario, carrinho, onCompraFinalizada } = route.params;
  const [itens, setItens] = useState(carrinho || []);

  // Use o contexto do tema
  const { darkMode } = useTheme();

  const total = itens.reduce((sum, item) => sum + item.preco, 0);

  // Cores baseadas no tema
  const CORES = {
    fundo: darkMode ? '#000000' : '#E6F0FF',
    card: darkMode ? '#1C1C1E' : '#FFFFFF',
    texto: darkMode ? '#FFFFFF' : '#000000',
    texto_secundario: darkMode ? '#98989F' : '#555555',
    primaria: '#007AFF',
    sucesso: '#34C759',
    borda: darkMode ? '#38383A' : '#E5E5EA'
  };

  async function finalizarCompra() {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');
    if (total > usuario.saldo) {
      return Alert.alert(
        'Saldo insuficiente', 
        `Você precisa de R$ ${total.toFixed(2)} mas tem apenas R$ ${usuario.saldo.toFixed(2)}.`
      );
    }

    try {
      const novoSaldo = usuario.saldo - total;

      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);
      if (error) throw error;

      // Registrar todas as transações
      for (let item of itens) {
        await supabase.from('cantina_transacoes').insert({
          usuario_id: usuario.id,
          produto_id: item.id,
          tipo: 'compra',
          valor: item.preco,
          descricao: `Compra: ${item.nome}`,
        });
      }

      Alert.alert(
        '✅ Compra realizada', 
        `Total: R$ ${total.toFixed(2)}\nNovo saldo: R$ ${novoSaldo.toFixed(2)}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (onCompraFinalizada) onCompraFinalizada(novoSaldo);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro na compra:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a compra.');
    }
  }

  const removerItem = (index) => {
    Alert.alert(
      'Remover item',
      'Deseja remover este item do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            const novosItens = [...itens];
            novosItens.splice(index, 1);
            setItens(novosItens);
          }
        }
      ]
    );
  };

  const limparCarrinho = () => {
    if (itens.length === 0) return;
    
    Alert.alert(
      'Limpar carrinho',
      'Deseja remover todos os itens do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: () => setItens([])
        }
      ]
    );
  };

  // Estilos dinâmicos
  const dynamicStyles = {
    container: {
      backgroundColor: CORES.fundo,
    },
    title: {
      color: CORES.texto,
    },
    card: {
      backgroundColor: CORES.card,
    },
    texto: {
      color: CORES.texto,
    }
  };

  const CarrinhoVazio = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="cart-outline" 
        size={64} 
        color={CORES.texto_secundario} 
      />
      <Text style={[styles.emptyTitle, { color: CORES.texto }]}>
        Carrinho vazio
      </Text>
      <Text style={[styles.emptySubtitle, { color: CORES.texto_secundario }]}>
        Adicione alguns produtos ao carrinho para continuar
      </Text>
      <TouchableOpacity 
        style={[styles.voltarButton, { backgroundColor: CORES.primaria }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.voltarText}>Voltar às compras</Text>
      </TouchableOpacity>
    </View>
  );

  const ItemCarrinho = ({ item, index }) => (
    <View style={[styles.itemCard, dynamicStyles.card]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemNome, dynamicStyles.texto]}>{item.nome}</Text>
        {item.descricao && (
          <Text style={[styles.itemDescricao, { color: CORES.texto_secundario }]}>
            {item.descricao}
          </Text>
        )}
        <Text style={styles.itemPreco}>R$ {item.preco.toFixed(2)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removerButton}
        onPress={() => removerItem(index)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CORES.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={CORES.primaria} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: CORES.texto }]}>Carrinho</Text>
        {itens.length > 0 && (
          <TouchableOpacity onPress={limparCarrinho}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {itens.length === 0 ? (
        <CarrinhoVazio />
      ) : (
        <View style={styles.content}>
          {/* Resumo */}
          <View style={[styles.resumoContainer, dynamicStyles.card]}>
            <Text style={[styles.resumoTitle, { color: CORES.texto }]}>
              Resumo do Pedido
            </Text>
            <View style={styles.resumoLinha}>
              <Text style={[styles.resumoLabel, { color: CORES.texto_secundario }]}>
                Itens no carrinho:
              </Text>
              <Text style={[styles.resumoValor, { color: CORES.texto }]}>
                {itens.length}
              </Text>
            </View>
            <View style={styles.resumoLinha}>
              <Text style={[styles.resumoLabel, { color: CORES.texto_secundario }]}>
                Total:
              </Text>
              <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
            </View>
            <View style={styles.resumoLinha}>
              <Text style={[styles.resumoLabel, { color: CORES.texto_secundario }]}>
                Saldo disponível:
              </Text>
              <Text style={[
                styles.saldoText,
                { color: usuario.saldo >= total ? CORES.sucesso : '#FF3B30' }
              ]}>
                R$ {usuario.saldo.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Lista de Itens */}
          <Text style={[styles.listaTitle, { color: CORES.texto }]}>
            Itens no Carrinho ({itens.length})
          </Text>
          
          <FlatList
            data={itens}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <ItemCarrinho item={item} index={index} />
            )}
            style={styles.lista}
            showsVerticalScrollIndicator={false}
          />

          {/* Botão Finalizar */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.finalizarButton, 
                { 
                  backgroundColor: usuario.saldo >= total ? CORES.sucesso : '#FF3B30',
                  opacity: usuario.saldo >= total ? 1 : 0.7
                }
              ]}
              onPress={finalizarCompra}
              disabled={usuario.saldo < total}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color="#FFFFFF" 
                style={styles.finalizarIcon}
              />
              <Text style={styles.finalizarText}>
                {usuario.saldo >= total 
                  ? `Finalizar Compra - R$ ${total.toFixed(2)}`
                  : 'Saldo Insuficiente'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  voltarButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  voltarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resumoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 14,
  },
  resumoValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  saldoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  lista: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescricao: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPreco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  removerButton: {
    padding: 8,
    marginLeft: 12,
  },
  footer: {
    paddingTop: 20,
  },
  finalizarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  finalizarIcon: {
    marginRight: 8,
  },
  finalizarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});