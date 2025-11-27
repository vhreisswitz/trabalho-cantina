import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/database';
import { useTheme } from '../ThemeContext';

export default function Home({ route, navigation }) {
  const { isDarkMode } = useTheme();

  // 🎨 Paleta SENAI refinada
  const CORES = {
    fundo: isDarkMode ? '#0D0D0F' : '#F2F4F8',
    card: isDarkMode ? '#18181B' : '#FFFFFF',
    borda: isDarkMode ? '#2A2A2D' : '#D9E2EC',
    texto: isDarkMode ? '#F2F2F7' : '#1A1A1C',
    textoSec: isDarkMode ? '#9C9CA3' : '#5C6B8A',
    azul: '#005CA9',
    laranja: '#FF6B35',
  };

  const DS = {
    fundo: { backgroundColor: CORES.fundo },
    card: {
      backgroundColor: CORES.card,
      borderColor: CORES.borda,
      shadowColor: isDarkMode ? '#000' : '#8AA3C0',
    },
    texto: { color: CORES.texto },
    textoSec: { color: CORES.textoSec },
  };

  const [produtos, setProdutos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    if (route.params?.usuario) {
      setUsuario(route.params.usuario);
      setSaldo(route.params.usuario.saldo || 0);
    } else {
      Alert.alert('Erro', 'Usuário não identificado.');
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
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }

  function adicionarAoCarrinho(produto) {
    setCarrinho(prev => [...prev, produto]);
    Alert.alert('Adicionado', `${produto.nome} foi para o carrinho!`);
  }

  async function comprarProduto(produto) {
    if (!usuario) return;

    if (saldo < produto.preco) {
      Alert.alert('Saldo insuficiente', `Você precisa de R$ ${produto.preco}.`);
      return;
    }

    try {
      const novoSaldo = saldo - produto.preco;

      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: novoSaldo })
        .eq('id', usuario.id);

      if (error) throw error;

      await supabase.from('cantina_transacoes').insert({
        usuario_id: usuario.id,
        produto_id: produto.id,
        tipo: 'compra',
        valor: produto.preco,
        descricao: `Compra: ${produto.nome}`,
      });

      setSaldo(novoSaldo);
      Alert.alert('Sucesso', `Você comprou: ${produto.nome}`);
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar a compra.');
    }
  }

  function irParaCarrinho() {
    if (carrinho.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos primeiro.');
      return;
    }

    navigation.navigate('Carrinho', {
      usuario,
      carrinho,
      onCompraFinalizada: (novoSaldo) => {
        setSaldo(novoSaldo);
        setCarrinho([]);
        setUsuario(prev => ({ ...prev, saldo: novoSaldo }));
      }
    });
  }

  return (
    <View style={[styles.container, DS.fundo]}>

      {/* ===== CABEÇALHO ===== */}
      <View style={[styles.header, { backgroundColor: CORES.azul }]}>

        <View style={styles.headerLeft}>
          <Text style={styles.logoSenai}>SENAI</Text>
          <Text style={styles.logoPalhoca}>PALHOÇA</Text>
          <Text style={styles.subtitle}>
            {usuario ? `Bem-vindo, ${usuario.nome}!` : 'Bem-vindo!'}
          </Text>
        </View>

        {/* Saldo + botões */}
        <View style={styles.headerRight}>

          <View style={[styles.saldoBox, DS.card]}>
            <Text style={[styles.saldoLabel, DS.textoSec]}>Saldo</Text>
            <Text style={[styles.saldoValor, { color: CORES.azul }]}>
              R$ {saldo.toFixed(2)}
            </Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={[styles.iconButton, DS.card]} onPress={irParaCarrinho}>
              <Text style={[styles.iconText, DS.texto]}>🛒</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, DS.card]}
              onPress={() => navigation.navigate('Configuracoes')}
            >
              <Text style={[styles.iconText, DS.texto]}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ===== PRODUTOS ===== */}
      <Text style={[styles.sectionTitle, DS.texto]}>🛍️ Produtos Disponíveis</Text>
      <Text style={[styles.sectionSubtitle, DS.textoSec]}>
        Cantina SENAI • Qualidade e rapidez
      </Text>

      {carregando ? (
        <ActivityIndicator size="large" color={CORES.azul} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(i) => i.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          renderItem={({ item }) => (
            <View style={[styles.card, DS.card]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.produtoNome, DS.texto]}>{item.nome}</Text>
                <Text style={[styles.produtoPreco, { color: CORES.azul }]}>
                  R$ {item.preco.toFixed(2)}
                </Text>
              </View>

              {item.descricao && (
                <Text style={[styles.produtoDescricao, DS.textoSec]}>
                  {item.descricao}
                </Text>
              )}

              <View style={styles.buttonsRow}>
                {/* ADD CARRINHO */}
                <TouchableOpacity
                  style={[styles.addCartBtn, { backgroundColor: CORES.laranja }]}
                  onPress={() => adicionarAoCarrinho(item)}
                >
                  <Text style={styles.addCartText}>+ Carrinho</Text>
                </TouchableOpacity>

                {/* COMPRAR */}
                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    { backgroundColor: saldo < item.preco ? '#444' : CORES.azul }
                  ]}
                  disabled={saldo < item.preco}
                  onPress={() => comprarProduto(item)}
                >
                  <Text style={styles.buyText}>
                    {saldo < item.preco ? 'Indisponível' : 'Comprar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

/* ===========================================
              ESTILOS OTIMIZADOS
=========================================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 8,
  },

  headerLeft: { flex: 1 },
  logoSenai: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  logoPalhoca: { color: '#fff', fontSize: 14, opacity: 0.9 },
  subtitle: { color: '#fff', marginTop: 6, fontSize: 13, opacity: 0.85 },

  headerRight: { alignItems: 'flex-end' },

  saldoBox: {
    padding: 14,
    borderRadius: 14,
    minWidth: 130,
    marginBottom: 10,
    borderWidth: 1,
  },

  saldoLabel: { fontSize: 12, fontWeight: '600' },
  saldoValor: { fontSize: 18, fontWeight: '800' },

  headerButtons: { flexDirection: 'row', gap: 12 },

  iconButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
  },
  iconText: { fontSize: 18 },

  sectionTitle: {
    textAlign: 'center',
    fontSize: 22,
    marginTop: 22,
    fontWeight: '800',
  },

  sectionSubtitle: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 13,
    fontWeight: '500',
  },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  produtoNome: { fontSize: 18, fontWeight: '700' },
  produtoPreco: { fontSize: 18, fontWeight: '800' },
  produtoDescricao: { marginTop: 6, fontSize: 13, lineHeight: 18, fontStyle: 'italic' },

  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },

  addCartBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  addCartText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },

  buyBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  buyText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
