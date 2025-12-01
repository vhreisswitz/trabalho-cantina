import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase, addCompra } from '../services/database';
import useCantinaTickets from '../hooks/useCantinaTickets';
import { useSaldo } from '../hooks/useSaldo';
import { useTheme } from '../context/themeContext';

export default function Home({ route, navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState([]);

  const { saldo, atualizarSaldo, definirUsuario } = useSaldo();
  const { darkMode } = useTheme();

  const {
    gerarTicketGratuito,
    comprarTicket,
    inicializarTicketBoasVindas,
    loading: loadingTicket
  } = useCantinaTickets();

  const CORES_SENAI = {
    azul_principal: '#005CA9',
    azul_escuro: '#003A6B',
    azul_claro: darkMode ? '#1E293B' : '#E6F0FF',
    branco: darkMode ? '#1E293B' : '#FFFFFF',
    laranja: '#FF6B35',
    cinza: darkMode ? '#94A3B8' : '#5C6B8A',
    texto: darkMode ? '#FFFFFF' : '#000000',
    texto_secundario: darkMode ? '#CBD5E1' : '#5C6B8A'
  };

  useEffect(() => {
    if (route.params?.usuario) {
      const usuarioData = route.params.usuario;
      setUsuario(usuarioData);
      definirUsuario(usuarioData.id);
      console.log('🏠 Home carregada - Inicializando ticket de boas-vindas...');
      inicializarTicketBoasVindas(usuarioData.id);
    } else {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      navigation.navigate('Login');
      return;
    }
    carregarProdutos();
  }, [route.params]);

  async function carregarProdutos() {
    try {
      const { data, error } = await supabase.from('cantina_produtos').select('*');
      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }

  function adicionarAoCarrinho(produto) {
    setCarrinho(prevCarrinho => [...prevCarrinho, produto]);
    Alert.alert('✅ Adicionado', `${produto.nome} foi adicionado ao carrinho!`);
  }

  async function comprarProduto(produto) {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');
    if (saldo < produto.preco) {
      return Alert.alert('Saldo insuficiente', `Você precisa de R$ ${produto.preco} para comprar este produto.`);
    }

    try {
      const transacao = await addCompra(usuario.id, produto.preco, produto.nome, 'Cantina SENAI');

      if (transacao) {
        const novoSaldo = saldo - produto.preco;
        atualizarSaldo(novoSaldo);

        Alert.alert('✅ Sucesso', `Você comprou: ${produto.nome}\nNovo saldo: R$ ${novoSaldo.toFixed(2)}`);
      } else {
        throw new Error('Falha ao criar transação');
      }
    } catch (error) {
      console.error('Erro na compra:', error);
      Alert.alert('Erro', 'Não foi possível realizar a compra.');
    }
  }

  function irParaExtrato() {
    navigation.navigate('Extrato', {
      usuario: { ...usuario, saldo }
    });
  }

  async function pegarTicketGratuito(produto) {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');

    Alert.alert(
      'Ticket Gratuito',
      `Deseja pegar um vale GRATUITO para ${produto.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pegar Vale Grátis',
          onPress: async () => {
            const ticket = await gerarTicketGratuito(produto.id, usuario.id);
            if (ticket) {
              navigation.navigate('TicketDigital', {
                ticket,
                usuario
              });
            }
          }
        }
      ]
    );
  }

  async function comprarTicketProduto(produto) {
    if (!usuario) return Alert.alert('Erro', 'Usuário não identificado.');

    Alert.alert(
      'Comprar Vale',
      `Deseja comprar um vale para ${produto.nome} por R$ ${produto.preco}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar Vale',
          onPress: async () => {
            const resultado = await comprarTicket(produto.id, usuario.id, saldo);
            if (resultado) {
              atualizarSaldo(resultado.novoSaldo);
              navigation.navigate('TicketDigital', {
                ticket: resultado.ticket,
                usuario: { ...usuario, saldo: resultado.novoSaldo }
              });
            }
          }
        }
      ]
    );
  }

  function irParaCarrinho() {
    if (carrinho.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione alguns produtos ao carrinho primeiro!');
      return;
    }

    navigation.navigate('Carrinho', {
      usuario,
      carrinho,
      onCompraFinalizada: (novoSaldo) => {
        atualizarSaldo(novoSaldo);
        setCarrinho([]);
        setUsuario(prevUsuario => ({ ...prevUsuario, saldo: novoSaldo }));
      }
    });
  }

  function irParaConfiguracoes() {
    navigation.navigate('Configuracoes', { usuario });
  }

  function irParaMeusTickets() {
    navigation.navigate('MeusTickets', { usuario });
  }

  function irParaRecarregarSaldo() {
    navigation.navigate('RecarregarSaldo', {
      usuario,
      onSaldoAtualizado: (novoSaldo) => {
        atualizarSaldo(novoSaldo);
      },
    });
  }

  function produtoAceitaTicket(produto) {
    return produto.codigo?.startsWith('P00');
  }

  return (
    <View style={[styles.container, { backgroundColor: CORES_SENAI.azul_claro }]}>
      <View style={[styles.header, { backgroundColor: CORES_SENAI.azul_principal }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoSenai}>SENAI</Text>
            <Text style={styles.logoPalhoca}>PALHOÇA</Text>
          </View>
          <Text style={styles.subtitle}>
            Seja bem-vindo{usuario ? `, ${usuario.nome}` : ''}!
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.saldoBox, { backgroundColor: CORES_SENAI.branco }]}>
            <Text style={styles.saldoLabel}>Saldo disponível</Text>
            <Text style={[styles.saldoValor, { color: CORES_SENAI.azul_principal }]}>
              R$ {saldo.toFixed(2)}
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.extratoButton, { backgroundColor: CORES_SENAI.branco }]}
              onPress={irParaExtrato}
            >
              <Text style={[styles.extratoIcon, { color: CORES_SENAI.azul_principal }]}>📊</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.carrinhoButton, { backgroundColor: CORES_SENAI.branco }]}
              onPress={irParaCarrinho}
            >
              <Text style={[styles.carrinhoIcon, { color: CORES_SENAI.azul_principal }]}>🛒</Text>
              {carrinho.length > 0 && (
                <View style={[styles.carrinhoBadge, { backgroundColor: CORES_SENAI.laranja }]}>
                  <Text style={styles.carrinhoBadgeText}>{carrinho.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ticketsButton, { backgroundColor: CORES_SENAI.branco }]}
              onPress={irParaMeusTickets}
            >
              <Text style={[styles.ticketsIcon, { color: CORES_SENAI.azul_principal }]}>🎫</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: CORES_SENAI.branco }]}
              onPress={irParaConfiguracoes}
            >
              <Text style={[styles.settingsIcon, { color: CORES_SENAI.azul_principal }]}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.botoesSuperiores}>
        <TouchableOpacity
          style={[styles.adicionarSaldoButton, { backgroundColor: CORES_SENAI.azul_escuro }]}
          onPress={irParaRecarregarSaldo}
        >
          <Text style={styles.adicionarSaldoText}>💰 Adicionar Saldo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: CORES_SENAI.azul_escuro }]}>
          🛍️ Produtos Disponíveis
        </Text>
        <Text style={[styles.sectionSubtitle, { color: CORES_SENAI.texto_secundario }]}>
          Cantina SENAI - Alimentação de qualidade
        </Text>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES_SENAI.azul_principal} />
          <Text style={[styles.loadingText, { color: CORES_SENAI.azul_escuro }]}>
            Carregando produtos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <View style={[styles.produtoCard, { backgroundColor: CORES_SENAI.branco }]}>
              <View style={styles.produtoInfo}>
                <Text style={[styles.produtoNome, { color: CORES_SENAI.texto }]}>
                  {item.nome}
                </Text>
                <Text style={[styles.produtoPreco, { color: CORES_SENAI.azul_principal }]}>
                  R$ {item.preco.toFixed(2)}
                </Text>
                {item.descricao && (
                  <Text style={[styles.produtoDescricao, { color: CORES_SENAI.texto_secundario }]}>
                    {item.descricao}
                  </Text>
                )}

                {produtoAceitaTicket(item) && (
                  <Text style={styles.ticketGratuitoInfo}>🎫 Disponível como Vale</Text>
                )}
              </View>

              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={[
                    styles.comprarButton,
                    { backgroundColor: CORES_SENAI.azul_principal },
                    saldo < item.preco && styles.comprarButtonDisabled,
                  ]}
                  onPress={() => comprarProduto(item)}
                  disabled={saldo < item.preco}
                >
                  <Text style={styles.comprarText}>
                    {saldo < item.preco ? 'Saldo Insuf.' : 'Comprar Agora'}
                  </Text>
                </TouchableOpacity>

                {produtoAceitaTicket(item) && (
                  <TouchableOpacity
                    style={[styles.ticketGratuitoButton, { backgroundColor: CORES_SENAI.laranja }]}
                    onPress={() => pegarTicketGratuito(item)}
                    disabled={loadingTicket}
                  >
                    <Text style={styles.ticketText}>
                      {loadingTicket ? '...' : 'Vale Grátis'}
                    </Text>
                  </TouchableOpacity>
                )}

                {produtoAceitaTicket(item) && (
                  <TouchableOpacity
                    style={[
                      styles.ticketButton,
                      { backgroundColor: CORES_SENAI.azul_escuro },
                      saldo < item.preco && styles.comprarButtonDisabled,
                    ]}
                    onPress={() => comprarTicketProduto(item)}
                    disabled={saldo < item.preco || loadingTicket}
                  >
                    <Text style={styles.ticketText}>
                      {loadingTicket ? '...' : 'Comprar Vale'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
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
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    marginBottom: 8,
  },
  logoSenai: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoPalhoca: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  subtitle: {
    color: '#FFFFFF',
    marginTop: 2,
    fontSize: 14,
    opacity: 0.9,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saldoBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  saldoLabel: {
    fontSize: 12,
    color: '#5C6B8A',
    fontWeight: '600',
  },
  saldoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  extratoButton: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  extratoIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  carrinhoButton: {
    padding: 12,
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  carrinhoAddText:{
    color: '#005CA9',
    fontWeight: 'bold',
    border: '1px solid #005CA9',
    paddingVertical: 6,
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
  },
  ticketsButton: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  carrinhoIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketsIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  carrinhoBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  carrinhoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  botoesSuperiores: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  adicionarSaldoButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  adicionarSaldoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  produtoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#005CA9',
  },
  produtoInfo: {
    marginBottom: 12,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  produtoPreco: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  produtoDescricao: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  ticketGratuitoInfo: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 4,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  comprarButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
  },
  comprarButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  comprarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  ticketGratuitoButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  ticketButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  ticketText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});