import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../services/database';

export default function RecarregarSaldo({ route, navigation }) {
  const { usuario, onSaldoAtualizado } = route.params;

  async function recarregar(valor) {
    try {
      const novoSaldo = (usuario.saldo || 0) + valor;

      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);

      if (error) throw error;

      await supabase.from('cantina_transacoes').insert({
        usuario_id: usuario.id,
        tipo: 'recarga',
        valor,
        descricao: `Recarga de R$ ${valor}`,
      });

      Alert.alert('Sucesso', `Saldo recarregado com R$ ${valor}!`);

      // ✅ Atualiza saldo na Home via callback
      if (onSaldoAtualizado) onSaldoAtualizado(novoSaldo);

      navigation.goBack();
    } catch (error) {
      console.error('Erro na recarga:', error);
      Alert.alert('Erro', 'Não foi possível realizar a recarga.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Saldo</Text>

      {[5, 10, 20, 50].map((valor) => (
        <TouchableOpacity
          key={valor}
          style={styles.botao}
          onPress={() => recarregar(valor)}
        >
          <Text style={styles.botaoTexto}>+ R$ {valor}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3d70',
    marginBottom: 30,
  },
  botao: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 3,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
