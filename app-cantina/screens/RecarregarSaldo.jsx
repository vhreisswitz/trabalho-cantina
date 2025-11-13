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

      Alert.alert('✅ Sucesso', `Saldo atualizado para R$ ${novoSaldo.toFixed(2)}`);
      navigation.goBack();
    } catch (error) {
      console.error('Erro na recarga:', error);
      Alert.alert('Erro', 'Não foi possível realizar a recarga.');
    }
  };

  // Estilos dinâmicos
  const dynamicStyles = {
    container: {
      backgroundColor: darkMode ? '#0F172A' : '#E6F0FF',
    },
    title: {
      color: darkMode ? '#FFFFFF' : '#000000',
    },
    botao: {
      backgroundColor: darkMode ? '#005CA9' : '#007AFF',
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Saldo</Text>
      <Text style={styles.saldoAtual}>Saldo atual: R$ {usuario.saldo?.toFixed(2) || '0.00'}</Text>

      {[5, 10, 20, 50, 100].map((valor) => (
        <TouchableOpacity
          key={valor}
          style={[styles.botao, dynamicStyles.botao]}
          onPress={() => recarregar(valor)}
        >
          <Text style={styles.botaoTexto}>+ R$ {valor}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.voltarButton, { backgroundColor: darkMode ? '#334155' : '#E2E8F0' }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.voltarText, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
          Voltar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  saldoAtual: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  botao: {
    padding: 18,
    borderRadius: 12,
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
  voltarButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: 150,
    alignItems: 'center',
  },
  voltarText: {
    fontSize: 16,
    fontWeight: '600',
  },
});