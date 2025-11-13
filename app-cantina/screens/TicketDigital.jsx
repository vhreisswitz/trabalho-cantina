import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import useCantinaTickets from '../hooks/useCantinaTickets';
import { useTheme } from '../context/themeContext'; // Importe o hook

export default function TicketDigital({ route, navigation }) {
  const { ticket, usuario } = route.params;
  const produto = ticket.cantina_produtos;
  const { utilizarTicket } = useCantinaTickets();

  // Use o contexto do tema
  const { darkMode } = useTheme();

  // Cores do SENAI com suporte a tema escuro
  const CORES_SENAI = {
    azul_principal: '#005CA9',
    azul_escuro: '#003A6B',
    azul_claro: darkMode ? '#1E293B' : '#E6F0FF',
    branco: darkMode ? '#1E293B' : '#FFFFFF',
    laranja: '#FF6B35',
    verde: '#34C759',
    cinza: darkMode ? '#94A3B8' : '#5C6B8A',
    texto: darkMode ? '#FFFFFF' : '#000000',
    texto_secundario: darkMode ? '#CBD5E1' : '#5C6B8A',
    card: darkMode ? '#334155' : '#FFFFFF',
    borda: darkMode ? '#475569' : '#E0E0E0'
  };

  // Função para compartilhar código
  const compartilharTicket = () => {
    Alert.alert(
      'Código do Ticket',
      `🎫 ${produto?.nome}\n📋 Código: ${ticket.ticket_code}\n💰 ${ticket.gratuito ? 'GRATUITO' : `R$ ${produto?.preco}`}\n📅 Emitido: ${new Date(ticket.created_at).toLocaleDateString('pt-BR')}`,
      [{ text: 'OK' }]
    );
  };

  // FUNÇÃO DE USAR TICKET
  const handleUsarTicket = async () => {
    try {
      // Chama função para usar (atualizar) o ticket
      const resultado = await utilizarTicket(ticket.qr_data);
      if (resultado?.sucesso) {
        Alert.alert('Ticket utilizado!', resultado.mensagem, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro ao utilizar', resultado?.mensagem || 'Falha desconhecida');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível utilizar o ticket');
    }
  };

  // Estilos dinâmicos
  const dynamicStyles = {
    container: {
      backgroundColor: CORES_SENAI.azul_claro,
    },
    header: {
      backgroundColor: CORES_SENAI.azul_principal,
    },
    ticketCard: {
      backgroundColor: CORES_SENAI.branco,
    },
    texto: {
      color: CORES_SENAI.texto,
    },
    textoSecundario: {
      color: CORES_SENAI.texto_secundario,
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, dynamicStyles.header]}>
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
        <View style={[styles.ticketCard, dynamicStyles.ticketCard]}>
          
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
              <Text style={[styles.infoLabel, { color: CORES_SENAI.texto_secundario }]}>Tipo:</Text>
              <Text style={[styles.infoValue, dynamicStyles.texto]}>
                {ticket.gratuito ? '🎁 GRATUITO' : '💰 PAGO'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: CORES_SENAI.texto_secundario }]}>Valor:</Text>
              <Text style={[styles.infoValue, dynamicStyles.texto]}>
                {ticket.gratuito ? 'GRATUITO' : `R$ ${produto?.preco}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: CORES_SENAI.texto_secundario }]}>Status:</Text>
              <Text style={[
                styles.infoValue, 
                { color: ticket.status === 'ativo' ? CORES_SENAI.verde : CORES_SENAI.cinza }
              ]}>
                {ticket.status === 'ativo' ? '✅ ATIVO' : '🔄 UTILIZADO'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: CORES_SENAI.texto_secundario }]}>Emitido em:</Text>
              <Text style={[styles.infoValue, dynamicStyles.texto]}>
                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {ticket.utilizado_em && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: CORES_SENAI.texto_secundario }]}>Utilizado em:</Text>
                <Text style={[styles.infoValue, dynamicStyles.texto]}>
                  {new Date(ticket.utilizado_em).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            {/* MENSAGEM ESPECIAL PARA TICKET DE BOAS-VINDAS */}
            {ticket.qr_data?.tipo === 'boas_vindas' && (
              <View style={[styles.mensagemPresente, { 
                backgroundColor: darkMode ? '#4A1E0F' : '#FFF3E0' 
              }]}>
                <Text style={[styles.mensagemTexto, { 
                  color: darkMode ? '#FFB74D' : '#E65100' 
                }]}>
                  🎉 {ticket.qr_data?.mensagem || 'Presente de boas-vindas!'}
                </Text>
              </View>
            )}
          </View>

          {/* RODAPÉ */}
          <View style={[styles.ticketFooter, { 
            backgroundColor: darkMode ? '#1E293B' : CORES_SENAI.azul_claro,
            borderTopColor: CORES_SENAI.borda
          }]}>
            <Text style={[styles.rodapeTexto, { color: CORES_SENAI.texto_secundario }]}>
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
          
          {/* BOTÃO USAR TICKET - aparece só se ativo */}
          {ticket.status === 'ativo' && (
            <TouchableOpacity
              style={[styles.botao, { backgroundColor: CORES_SENAI.verde }]}
              onPress={handleUsarTicket}
            >
              <Text style={styles.botaoTexto}>Usar Ticket</Text>
            </TouchableOpacity>
          )}
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
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
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
  },
  rodapeTexto: {
    fontSize: 12,
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
    marginBottom: 8,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});