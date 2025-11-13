import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../services/database';

export default function Carrinho({ route, navigation }) {
  const { usuario, carrinho, onCompraFinalizada } = route.params;
  const [itens, setItens] = useState(carrinho || []);

  const total = itens.reduce((sum, item) => sum + item.preco, 0);

  async function finalizarCompra() {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');
    if (total > usuario.saldo) return Alert.alert('Saldo insuficiente', 'Você não tem saldo suficiente.');

    try {
      const novoSaldo = usuario.saldo - total;

      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);
      if (error) throw error;

      for (let item of itens) {
        await supabase.from('cantina_transacoes').insert({
          usuario_id: usuario.id,
          produto_id: item.id,
          tipo: 'compra',
          valor: item.preco,
          descricao: `Compra: ${item.nome}`,
        });
      }

      Alert.alert('✅ Compra realizada', `Total: R$ ${total.toFixed(2)}`);
      if (onCompraFinalizada) onCompraFinalizada(novoSaldo);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível finalizar a compra.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Carrinho</Text>

      {itens.length === 0 ? (
        <Text style={styles.vazioText}>Seu carrinho está vazio</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item, index) => index.toString()}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemPreco}>R$ {item.preco.toFixed(2)}</Text>
            </View>
          )}
        />
      )}

      {itens.length > 0 && (
        <TouchableOpacity style={styles.finalizarButton} onPress={finalizarCompra}>
          <Text style={styles.finalizarText}>Finalizar Compra (R$ {total.toFixed(2)})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f0ff', padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e3d70', marginBottom: 20 },
  vazioText: { color: '#555', fontSize: 16, marginTop: 20 },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  itemNome: { fontSize: 16, color: '#333', fontWeight: '600' },
  itemPreco: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  finalizarButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3,
  },
  finalizarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
