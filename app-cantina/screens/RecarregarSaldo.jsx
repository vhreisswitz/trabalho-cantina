import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../services/database';

export default function RecarregarSaldo({ route, navigation }) {
  const { usuario, onSaldoAtualizado } = route.params;

  const recarregar = async (valor) => {
    try {
      const novoSaldo = usuario.saldo + valor; // Soma o valor ao saldo atual

      // Atualiza o saldo no banco de dados
      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);

      if (error) throw error;

      // Atualiza o saldo na tela principal via callback
      if (onSaldoAtualizado) onSaldoAtualizado(novoSaldo);

      Alert.alert('✅ Sucesso', `Saldo atualizado para R$ ${novoSaldo.toFixed(2)}`);
      navigation.goBack(); // Volta para a tela anterior
    } catch (error) {
      console.error('Erro na recarga:', error);
      Alert.alert('Erro', 'Não foi possível realizar a recarga.');
    }
  };

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
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: 150,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});