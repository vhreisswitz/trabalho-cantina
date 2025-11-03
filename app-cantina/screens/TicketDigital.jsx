// screens/TicketDigital.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TicketDigital({ route, navigation }) {
  const { ticket, usuario } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botaoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Ticket Digital</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>Ticket Digital</Text>
        <Text style={styles.info}>
          Aqui aparecerá o QR Code do ticket
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#005CA9',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  botaoVoltar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003A6B',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#5C6B8A',
    textAlign: 'center',
  },
});