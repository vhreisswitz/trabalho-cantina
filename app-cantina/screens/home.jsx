// screens/home.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../src/config/supabase';

export default function Home() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregarProdutos();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produtos da Cantina</Text>
      <FlatList
        data={produtos}
        keyExtractor={item => item.cod}
        renderItem={({ item }) => (
          <View style={styles.produtoItem}>
            <Text style={styles.codigo}>{item.cod}</Text>
            <Text style={styles.descricao}>{item.desc}</Text>
            <Text style={styles.preco}>R$ {item.preco}</Text>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  codigo: {
    fontWeight: 'bold',
    width: 50,
  },
  descricao: {
    flex: 1,
    marginLeft: 10,
  },
  preco: {
    fontWeight: 'bold',
    color: 'green',
  },
});