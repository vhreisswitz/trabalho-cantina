import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../services/database';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    carregarProdutos();
    carregarUsuario();
  }, []);

  async function carregarProdutos() {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*');
      
      if (error) {
        console.error('Erro ao carregar produtos:', error);
      } else {
        setProdutos(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function carregarUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsuario(user);
        const { data, error } = await supabase
          .from('usuarios')
          .select('saldo')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setSaldo(data.saldo);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }

  async function comprarProduto(produto) {
    if (saldo < produto.preco) {
      Alert.alert('Saldo insuficiente', `Você precisa de R$ ${produto.preco} para comprar este produto.`);
      return;
    }

    try {
      const novoSaldo = saldo - produto.preco;
      
      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);

      if (error) {
        Alert.alert('Erro', 'Não foi possível realizar a compra.');
        return;
      }

      const { error: erroTransacao } = await supabase
        .from('transacoes')
        .insert({
          usuario_id: usuario.id,
          produto_id: produto.id,
          tipo: 'compra',
          valor: produto.preco,
          descricao: `Compra: ${produto.desc}`
        });

      setSaldo(novoSaldo);
      Alert.alert('Sucesso', `Compra realizada: ${produto.desc}`);
      
    } catch (error) {
      console.error('Erro na compra:', error);
      Alert.alert('Erro', 'Não foi possível realizar a compra.');
    }
  }

  async function recarregarSaldo() {
    try {
      const novoSaldo = saldo + 10.00;
      
      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);

      if (error) {
        Alert.alert('Erro', 'Não foi possível recarregar o saldo.');
        return;
      }

      const { error: erroTransacao } = await supabase
        .from('transacoes')
        .insert({
          usuario_id: usuario.id,
          tipo: 'recarga',
          valor: 10.00,
          descricao: 'Recarga de saldo'
        });

      setSaldo(novoSaldo);
      Alert.alert('Sucesso', 'Saldo recarregado com sucesso!');
      
    } catch (error) {
      console.error('Erro na recarga:', error);
      Alert.alert('Erro', 'Não foi possível recarregar o saldo.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cantina SENAI</Text>
        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Saldo:</Text>
          <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.recarregarButton} onPress={recarregarSaldo}>
          <Text style={styles.recarregarText}>+ R$ 10,00</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Produtos Disponíveis</Text>
      
      <FlatList
        data={produtos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.produtoItem}
            onPress={() => comprarProduto(item)}
          >
            <View style={styles.produtoInfo}>
              <Text style={styles.codigo}>{item.cod}</Text>
              <Text style={styles.descricao}>{item.desc}</Text>
              <Text style={styles.preco}>R$ {item.preco}</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.comprarButton,
                saldo < item.preco && styles.comprarButtonDisabled
              ]}
              onPress={() => comprarProduto(item)}
              disabled={saldo < item.preco}
            >
              <Text style={styles.comprarText}>COMPRAR</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  saldoContainer: {
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 14,
    color: '#666',
  },
  saldoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  recarregarButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  recarregarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  produtoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codigo: {
    fontWeight: 'bold',
    width: 50,
    color: '#333',
  },
  descricao: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
  },
  preco: {
    fontWeight: 'bold',
    color: 'green',
    marginRight: 10,
  },
  comprarButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  comprarButtonDisabled: {
    backgroundColor: '#ccc',
  },
  comprarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});