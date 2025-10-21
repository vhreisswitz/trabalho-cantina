import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/database';

export default function Home({ route, navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState([]); // ✅ Estado do carrinho

  useEffect(() => {
    if (route.params?.usuario) {
      setUsuario(route.params.usuario);
      setSaldo(route.params.usuario.saldo || 0);
    } else {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      navigation.navigate('Login');
      return;
    }
    carregarProdutos();
  }, [route.params]);

  async function carregarProdutos() {
    try {
      const { data, error } = await supabase.from('cantina_produtos').select('*');
      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }

  // ✅ Função para adicionar produto ao carrinho
  function adicionarAoCarrinho(produto) {
    setCarrinho(prevCarrinho => [...prevCarrinho, produto]);
    Alert.alert('✅ Adicionado', `${produto.nome} foi adicionado ao carrinho!`);
  }

  // ✅ Função para comprar produto individual (mantida do código original)
  async function comprarProduto(produto) {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');
    if (saldo < produto.preco) {
      return Alert.alert('Saldo insuficiente', `Você precisa de R$ ${produto.preco} para comprar este produto.`);
    }

    try {
      const novoSaldo = saldo - produto.preco;

      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);

      if (error) throw error;

      await supabase.from('cantina_transacoes').insert({
        usuario_id: usuario.id,
        produto_id: produto.id,
        tipo: 'compra',
        valor: produto.preco,
        descricao: `Compra: ${produto.nome}`,
      });

      setSaldo(novoSaldo);
      Alert.alert('✅ Sucesso', `Você comprou: ${produto.nome}`);
    } catch (error) {
      console.error('Erro na compra:', error);
      Alert.alert('Erro', 'Não foi possível realizar a compra.');
    }
  }

  // ✅ Função para ir para o carrinho
  function irParaCarrinho() {
    if (carrinho.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione alguns produtos ao carrinho primeiro!');
      return;
    }
    
    navigation.navigate('Carrinho', { 
      usuario, 
      carrinho,
      onCompraFinalizada: (novoSaldo) => {
        setSaldo(novoSaldo);
        setCarrinho([]); // Limpa o carrinho após compra
        setUsuario(prevUsuario => ({ ...prevUsuario, saldo: novoSaldo }));
      }
    });
  }

  return (
    <View style={styles.container}>
      {/* ✅ HEADER ATUALIZADO COM BOTÃO DO CARRINHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍔 Cantina SENAI</Text>
          <Text style={styles.subtitle}>
            Seja bem-vindo{usuario ? `, ${usuario.nome}` : ''}!
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.saldoBox}>
            <Text style={styles.saldoLabel}>Saldo atual</Text>
            <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
          </View>
          
          {/* ✅ BOTÃO DO CARRINHO */}
          <TouchableOpacity style={styles.carrinhoButton} onPress={irParaCarrinho}>
            <Text style={styles.carrinhoIcon}>🛒</Text>
            {carrinho.length > 0 && (
              <View style={styles.carrinhoBadge}>
                <Text style={styles.carrinhoBadgeText}>{carrinho.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.adicionarSaldoButton}
        onPress={() =>
          navigation.navigate('RecarregarSaldo', {
            usuario,
            onSaldoAtualizado: (novoSaldo) => {
              setSaldo(novoSaldo);
              setUsuario((prevUsuario) => ({ ...prevUsuario, saldo: novoSaldo }));
            },
          })
        }
      >
        <Text style={styles.adicionarSaldoText}>💰 Adicionar Saldo</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>🛍️ Produtos Disponíveis</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#005bbb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.produtoCard}>
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{item.nome}</Text>
                <Text style={styles.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
              </View>

              <View style={styles.botoesContainer}>
                {/* ✅ BOTÃO ADICIONAR AO CARRINHO */}
                <TouchableOpacity
                  style={styles.carrinhoAddButton}
                  onPress={() => adicionarAoCarrinho(item)}
                >
                  <Text style={styles.carrinhoAddText}>+ Carrinho</Text>
                </TouchableOpacity>

                {/* ✅ BOTÃO COMPRAR (original) */}
                <TouchableOpacity
                  style={[
                    styles.comprarButton,
                    saldo < item.preco && styles.comprarButtonDisabled,
                  ]}
                  onPress={() => comprarProduto(item)}
                  disabled={saldo < item.preco}
                >
                  <Text style={styles.comprarText}>
                    {saldo < item.preco ? 'Saldo Insuficiente' : 'Comprar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0ff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3d70',
  },
  subtitle: {
    color: '#5c6b8a',
    marginTop: 2,
    fontSize: 14,
  },
  saldoBox: {
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
    padding: 10,
    borderRadius: 10,
  },
  saldoLabel: {
    fontSize: 13,
    color: '#555',
  },
  saldoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  // ✅ ESTILOS DO CARRINHO
  carrinhoButton: {
    backgroundColor: '#ff6b35',
    padding: 12,
    borderRadius: 10,
    position: 'relative',
  },
  carrinhoIcon: {
    fontSize: 18,
  },
  carrinhoBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carrinhoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adicionarSaldoButton: {
    backgroundColor: '#007AFF',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  adicionarSaldoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3d70',
    marginBottom: 10,
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  produtoInfo: {
    marginBottom: 10,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  produtoPreco: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  carrinhoAddButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  carrinhoAddText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  comprarButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
  },
  comprarButtonDisabled: {
    backgroundColor: '#ccc',
  },
  comprarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
});