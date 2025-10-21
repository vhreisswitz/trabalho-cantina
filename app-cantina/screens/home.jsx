import React, { useEffect, useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

export default function Home({ route, navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState([]);

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

  useFocusEffect(
    useCallback(() => {
      async function atualizarSaldo() {
        if (!usuario) return;
        try {
          const { data, error } = await supabase
            .from('usuarios')
            .select('saldo')
            .eq('id', usuario.id)
            .single();
          if (!error && data) setSaldo(data.saldo);
        } catch (error) {
          console.error('Erro ao atualizar saldo:', error);
        }
      }
      atualizarSaldo();
    }, [usuario])
  );

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

  function adicionarAoCarrinho(produto) {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');
    setCarrinho(prev => [...prev, produto]);
    Alert.alert('✅ Adicionado ao carrinho', produto.nome);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍔 Cantina SENAI</Text>
          <Text style={styles.subtitle}>
            Seja bem-vindo{usuario ? `, ${usuario.nome}` : ''}!
          </Text>
        </View>

        <View style={styles.saldoBox}>
          <Text style={styles.saldoLabel}>Saldo atual</Text>
          <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.adicionarSaldoButton}
        onPress={() =>
          navigation.navigate('RecarregarSaldo', {
            usuario,
            onSaldoAtualizado: (novoSaldo) => {
              setSaldo(novoSaldo); // Atualiza o saldo na tela Home
              setUsuario((prevUsuario) => ({ ...prevUsuario, saldo: novoSaldo })); // Atualiza o usuário com o novo saldo
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

              <TouchableOpacity
                style={[
                  styles.comprarButton,
                  saldo < item.preco && styles.comprarButtonDisabled,
                ]}
                onPress={() => adicionarAoCarrinho(item)}
                disabled={saldo < item.preco}
              >
                <Text style={styles.comprarText}>
                  {saldo < item.preco ? 'Saldo Insuficiente' : 'Adicionar ao Carrinho'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f0ff', padding: 20 },
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e3d70' },
  subtitle: { color: '#5c6b8a', marginTop: 2, fontSize: 14 },
  saldoBox: { alignItems: 'center', backgroundColor: '#eaf4ff', padding: 10, borderRadius: 10 },
  saldoLabel: { fontSize: 13, color: '#555' },
  saldoValor: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginTop: 4 },
  adicionarSaldoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  adicionarSaldoText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  carrinhoButton: {
    backgroundColor: '#ff9500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  carrinhoText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e3d70', marginBottom: 10 },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  produtoInfo: { flex: 1, marginRight: 10 },
  produtoNome: { fontSize: 16, fontWeight: '600', color: '#333' },
  produtoPreco: { fontSize: 14, color: '#007AFF', fontWeight: 'bold', marginTop: 4 },
  comprarButton: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  comprarButtonDisabled: { backgroundColor: '#ccc' },
  comprarText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
