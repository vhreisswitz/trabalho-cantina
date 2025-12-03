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
    // Tema escuro estilo DeepSeek (cinza muito escuro, não preto puro)
    fundo_principal: darkMode ? '#0d1117' : '#FFFFFF', // Fundo principal (cinza muito escuro)
    fundo_header: darkMode ? '#161b22' : '#005CA9', // Header (cinza escuro)
    fundo_card: darkMode ? '#21262d' : '#FFFFFF', // Cards (cinza médio-escuro)
    fundo_elevated: darkMode ? '#30363d' : '#F8F9FA', // Elementos elevados

    // Cores de destaque
    azul_principal: darkMode ? '#58a6ff' : '#005CA9', // Azul vibrante (como links do DeepSeek)
    azul_escuro: darkMode ? '#1f6feb' : '#003A6B', // Azul mais escuro
    azul_claro: darkMode ? '#13233a' : '#E6F0FF', // Azul de fundo suave
    laranja: darkMode ? '#f78166' : '#FF6B35', // Laranja (como botões do DeepSeek)
    laranja_escuro: darkMode ? '#da3633' : '#D84315',

    // Cores neutras
    branco: darkMode ? '#21262d' : '#FFFFFF',
    cinza_claro: darkMode ? '#6e7681' : '#95a5a6',
    cinza_medio: darkMode ? '#484f58' : '#bdc3c7',
    cinza_escuro: darkMode ? '#30363d' : '#7f8c8d',
    borda: darkMode ? '#30363d' : '#E2E8F0',

    // Cores de texto
    texto: darkMode ? '#f0f6fc' : '#000000', // Texto principal (branco acinzentado)
    texto_secundario: darkMode ? '#8b949e' : '#5C6B8A', // Texto secundário
    texto_claro: darkMode ? '#6e7681' : '#95a5a6', // Texto menos importante

    // Estados
    desativado: darkMode ? '#484f58' : '#CCCCCC',
    sucesso: darkMode ? '#238636' : '#2ecc71',
    erro: darkMode ? '#f85149' : '#e74c3c'
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
    <View style={[styles.container, { backgroundColor: CORES_SENAI.fundo_principal }]}>
      <View style={[styles.header, {
        backgroundColor: CORES_SENAI.fundo_header,
        borderBottomWidth: 1,
        borderBottomColor: CORES_SENAI.borda
      }]}>
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
          <View style={[styles.saldoBox, {
            backgroundColor: CORES_SENAI.fundo_card,
            borderWidth: 1,
            borderColor: CORES_SENAI.borda
          }]}>
            <Text style={[styles.saldoLabel, { color: CORES_SENAI.texto_secundario }]}>Saldo disponível</Text>
            <Text style={[styles.saldoValor, { color: CORES_SENAI.azul_principal }]}>
              R$ {saldo.toFixed(2)}
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: CORES_SENAI.fundo_card,
                borderWidth: 1,
                borderColor: CORES_SENAI.borda
              }]}
              onPress={irParaExtrato}
            >
              <Text style={[styles.actionIcon, { color: CORES_SENAI.azul_principal }]}>📊</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: CORES_SENAI.fundo_card,
                borderWidth: 1,
                borderColor: CORES_SENAI.borda
              }]}
              onPress={irParaCarrinho}
            >
              <Text style={[styles.actionIcon, { color: CORES_SENAI.azul_principal }]}>🛒</Text>
              {carrinho.length > 0 && (
                <View style={[styles.carrinhoBadge, { backgroundColor: CORES_SENAI.laranja }]}>
                  <Text style={styles.carrinhoBadgeText}>{carrinho.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: CORES_SENAI.fundo_card,
                borderWidth: 1,
                borderColor: CORES_SENAI.borda
              }]}
              onPress={irParaMeusTickets}
            >
              <Text style={[styles.actionIcon, { color: CORES_SENAI.azul_principal }]}>🎫</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, {
                backgroundColor: CORES_SENAI.fundo_card,
                borderWidth: 1,
                borderColor: CORES_SENAI.borda
              }]}
              onPress={irParaConfiguracoes}
            >
              <Text style={[styles.actionIcon, { color: CORES_SENAI.azul_principal }]}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.botoesSuperiores}>
        <TouchableOpacity
          style={[styles.adicionarSaldoButton, {
            backgroundColor: CORES_SENAI.azul_escuro,
            borderWidth: 1,
            borderColor: darkMode ? '#388bfd' : CORES_SENAI.azul_escuro
          }]}
          onPress={irParaRecarregarSaldo}
        >
          <Text style={styles.adicionarSaldoText}>💰 Adicionar Saldo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: CORES_SENAI.texto }]}>
          🛍️ Produtos Disponíveis
        </Text>
        <Text style={[styles.sectionSubtitle, { color: CORES_SENAI.texto_secundario }]}>
          Cantina SENAI - Alimentação de qualidade
        </Text>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES_SENAI.azul_principal} />
          <Text style={[styles.loadingText, { color: CORES_SENAI.texto }]}>
            Carregando produtos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <View style={[styles.produtoCard, {
              backgroundColor: CORES_SENAI.fundo_card,
              borderColor: CORES_SENAI.borda,
              borderWidth: 1,
              borderLeftWidth: 4,
              borderLeftColor: CORES_SENAI.azul_principal
            }]}>
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
                  <View style={styles.ticketInfoContainer}>
                    <Text style={[styles.ticketGratuitoInfo, { color: CORES_SENAI.laranja }]}>
                      🎫 Disponível como Vale
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={[
                    styles.comprarButton,
                    {
                      backgroundColor: CORES_SENAI.azul_principal,
                      borderWidth: 1,
                      borderColor: darkMode ? '#388bfd' : CORES_SENAI.azul_principal
                    },
                    saldo < item.preco && [styles.comprarButtonDisabled, {
                      backgroundColor: CORES_SENAI.desativado,
                      borderColor: CORES_SENAI.cinza_medio
                    }],
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
                    style={[
                      styles.ticketGratuitoButton,
                      {
                        backgroundColor: CORES_SENAI.laranja,
                        borderWidth: 1,
                        borderColor: darkMode ? '#f78166' : CORES_SENAI.laranja
                      }
                    ]}
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
                    style={styles.carrinhoAddButton}
                    onPress={() => adicionarAoCarrinho(item)}
                  ><Text style={styles.carrinhoAddText}>+ Carrinho</Text>
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

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 55,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logoSenai: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#fff',
  },
  logoPalhoca: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
    color: '#fff',
    marginTop: -2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    color: '#fff',
    marginTop: 6,
  },

  headerRight: {
    alignItems: 'flex-end',
    gap: 10,
  },

  saldoBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 110,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  saldoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  saldoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },

  headerButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },

  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },

  actionIcon: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  carrinhoBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF6B35',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  carrinhoBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  carrinhoAddButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFA500',
    flex: 1,
    alignItems: 'center',
  },
  carrinhoAddText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  botoesSuperiores: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  adicionarSaldoButton: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 12,
    elevation: 4,
  },
  adicionarSaldoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },

  /* TÍTULOS */
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },

  /* LOADING */
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },

  /* LISTA */
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* CARD PRODUTO */
  produtoCard: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  produtoInfo: {
    marginBottom: 14,
  },
  produtoNome: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  produtoPreco: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  produtoDescricao: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  ticketInfoContainer: {
    marginTop: 8,
  },
  ticketGratuitoInfo: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* BOTÕES PRODUTO */
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  comprarButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  comprarButtonDisabled: {
    opacity: 0.6,
  },
  comprarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  ticketGratuitoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  ticketButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  ticketText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
