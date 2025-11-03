// screens/TicketDigital.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function TicketDigital({ route, navigation }) {
  const { ticket, usuario } = route.params;
  const produto = ticket.cantina_produtos;

  const CORES_SENAI = {
    azul_principal: '#005CA9',
    azul_escuro: '#003A6B',
    azul_claro: '#E6F0FF',
    branco: '#FFFFFF',
    laranja: '#FF6B35',
    verde: '#34C759'
  };

  const compartilharTicket = () => {
    Alert.alert(
      'Código do Ticket',
      `🎫 ${produto?.nome}\n📋 Código: ${ticket.ticket_code}\n💰 ${ticket.gratuito ? 'GRATUITO' : `R$ ${produto?.preco}`}\n📅 Emitido: ${new Date(ticket.created_at).toLocaleDateString('pt-BR')}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: CORES_SENAI.azul_claro }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: CORES_SENAI.azul_principal }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.botaoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Ticket Digital</Text>
        <TouchableOpacity onPress={compartilharTicket}>
          <Text style={styles.botaoCompartilhar}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* CARTÃO DO TICKET */}
        <View style={[styles.ticketCard, { backgroundColor: CORES_SENAI.branco }]}>
          
          {/* CABEÇALHO COM LOGO SENAI */}
          <View style={[styles.ticketHeader, { backgroundColor: CORES_SENAI.azul_principal }]}>
            <Text style={styles.logoSenai}>SENAI</Text>
            <Text style={styles.logoPalhoca}>PALHOÇA</Text>
            <Text style={styles.ticketTitulo}>TICKET DIGITAL</Text>
          </View>

          {/* QR CODE */}
          <View style={styles.qrContainer}>
            <QRCode
              value={JSON.stringify(ticket.qr_data)}
              size={220}
              backgroundColor={CORES_SENAI.branco}
              color={CORES_SENAI.azul_escuro}
            />
          </View>

          {/* INFORMAÇÕES DO TICKET */}
          <View style={styles.infoContainer}>
            <Text style={[styles.produtoNome, { color: CORES_SENAI.azul_escuro }]}>
              {produto?.nome}
            </Text>
            
            <Text style={[styles.ticketCode, { color: CORES_SENAI.azul_principal }]}>
              {ticket.ticket_code}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>
                {ticket.gratuito ? '🎁 GRATUITO' : '💰 PAGO'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valor:</Text>
              <Text style={styles.infoValue}>
                {ticket.gratuito ? 'GRATUITO' : `R$ ${produto?.preco}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[
                styles.infoValue, 
                { color: ticket.status === 'ativo' ? CORES_SENAI.verde : CORES_SENAI.cinza }
              ]}>
                {ticket.status === 'ativo' ? '✅ ATIVO' : '🔄 UTILIZADO'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Emitido em:</Text>
              <Text style={styles.infoValue}>
                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {ticket.utilizado_em && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Utilizado em:</Text>
                <Text style={styles.infoValue}>
                  {new Date(ticket.utilizado_em).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            {/* MENSAGEM ESPECIAL PARA TICKET DE BOAS-VINDAS */}
            {ticket.qr_data?.tipo === 'boas_vindas' && (
              <View style={[styles.mensagemPresente, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.mensagemTexto, { color: '#E65100' }]}>
                  🎉 {ticket.qr_data?.mensagem || 'Presente de boas-vindas!'}
                </Text>
              </View>
            )}
          </View>

          {/* RODAPÉ */}
          <View style={[styles.ticketFooter, { backgroundColor: CORES_SENAI.azul_claro }]}>
            <Text style={styles.rodapeTexto}>
              Apresente este QR Code na cantina para resgatar seu produto
            </Text>
          </View>
        </View>

        {/* BOTÕES */}
        <View style={styles.botoesContainer}>
          <TouchableOpacity 
            style={[styles.botao, { backgroundColor: CORES_SENAI.azul_principal }]}
            onPress={compartilharTicket}
          >
            <Text style={styles.botaoTexto}>Compartilhar Código</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.botao, { backgroundColor: CORES_SENAI.laranja }]}
            onPress={() => navigation.navigate('MeusTickets', { usuario })}
          >
            <Text style={styles.botaoTexto}>Ver Todos os Tickets</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  botaoCompartilhar: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  ticketCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  ticketHeader: {
    padding: 20,
    alignItems: 'center',
  },
  logoSenai: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logoPalhoca: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9,
  },
  ticketTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  qrContainer: {
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoContainer: {
    padding: 20,
  },
  produtoNome: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ticketCode: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#5C6B8A',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#003A6B',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  mensagemPresente: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  mensagemTexto: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  ticketFooter: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rodapeTexto: {
    fontSize: 12,
    color: '#5C6B8A',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  botoesContainer: {
    width: '100%',
    gap: 12,
  },
  botao: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});