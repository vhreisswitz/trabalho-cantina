import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { addRecarga, getSaldoUsuario } from '../services/database'; // Importe as funções corretas

export default function RecarregarSaldo({ route, navigation }) {
  const { usuario, onSaldoAtualizado } = route.params;

  const recarregar = async (valor) => {
    try {
      // Usa a função addRecarga que já cria a transação E atualiza o saldo
      const transacao = await addRecarga(usuario.id, valor);
      
      if (transacao) {
        // Busca o saldo atualizado
        const novoSaldo = await getSaldoUsuario(usuario.id);
        
        // Atualiza o saldo na tela principal via callback
        if (onSaldoAtualizado) onSaldoAtualizado(novoSaldo);

        Alert.alert('✅ Sucesso', `Saldo recarregado com sucesso!\nNovo saldo: R$ ${novoSaldo.toFixed(2)}`);
        navigation.goBack();
      } else {
        throw new Error('Falha ao criar transação');
      }
    } catch (error) {
      console.error('Erro na recarga:', error);
      Alert.alert('Erro', 'Não foi possível realizar a recarga.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Saldo</Text>
      <Text style={styles.saldoAtual}>Saldo atual: R$ {usuario.saldo?.toFixed(2) || '0.00'}</Text>

      {[5, 10, 20, 50, 100].map((valor) => (
        <TouchableOpacity
          key={valor}
          style={styles.botao}
          onPress={() => recarregar(valor)}
        >
          <Text style={styles.botaoTexto}>+ R$ {valor}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botaoVoltarTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  saldoAtual: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    width: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botaoVoltar: {
    marginTop: 20,
    padding: 12,
  },
  botaoVoltarTexto: {
    color: '#007AFF',
    fontSize: 16,
  },
});