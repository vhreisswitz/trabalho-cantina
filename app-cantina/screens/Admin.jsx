import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/database';

export default function Admin() {
  const navigation = useNavigation();
  const [abaAtiva, setAbaAtiva] = useState('usuarios'); // 'usuarios', 'produtos'
  const [carregando, setCarregando] = useState(false);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <TouchableOpacity 
          style={styles.voltarButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.voltarText}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* ABAS */}
      <View style={styles.abasContainer}>
        <TouchableOpacity 
          style={[styles.aba, abaAtiva === 'usuarios' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('usuarios')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'usuarios' && styles.abaTextoAtiva]}>
            👥 Usuários
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.aba, abaAtiva === 'produtos' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('produtos')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'produtos' && styles.abaTextoAtiva]}>
            🛍️ Produtos
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO DAS ABAS */}
      <ScrollView style={styles.conteudo}>
        {abaAtiva === 'usuarios' ? (
          <GerenciarUsuarios />
        ) : (
          <GerenciarProdutos />
        )}
      </ScrollView>
    </View>
  );
}

function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({
      nome: '',
      matricula: '',
      saldo: '0'
    });
    const [carregando, setCarregando] = useState(false);
  
    // Buscar usuários existentes
    const carregarUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        setUsuarios(data || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os usuários');
      }
    };
  
    // Cadastrar novo usuário
    const cadastrarUsuario = async () => {
      if (!formData.nome || !formData.matricula) {
        Alert.alert('Erro', 'Preencha nome e matrícula');
        return;
      }
  
      setCarregando(true);
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .insert([
            {
              nome: formData.nome,
              matricula: formData.matricula,
              saldo: parseFloat(formData.saldo) || 0
            }
          ])
          .select();
  
        if (error) throw error;
  
        Alert.alert('Sucesso', 'Usuário cadastrado!');
        setFormData({ nome: '', matricula: '', saldo: '0' });
        carregarUsuarios(); // Recarrega a lista
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível cadastrar o usuário');
      } finally {
        setCarregando(false);
      }
    };
  
    // Carrega usuários quando o componente monta
    useEffect(() => {
      carregarUsuarios();
    }, []);
  
    return (
      <View style={styles.abaConteudo}>
        <Text style={styles.tituloSecao}>Cadastrar Novo Usuário</Text>
        
        {/* FORMULÁRIO */}
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={formData.nome}
          onChangeText={(text) => setFormData({...formData, nome: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Matrícula"
          keyboardType="numeric"
          value={formData.matricula}
          onChangeText={(text) => setFormData({...formData, matricula: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Saldo inicial"
          keyboardType="numeric"
          value={formData.saldo}
          onChangeText={(text) => setFormData({...formData, saldo: text})}
        />
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, carregando && styles.buttonDisabled]}
          onPress={cadastrarUsuario}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>
            {carregando ? 'Cadastrando...' : '📝 Cadastrar Usuário'}
          </Text>
        </TouchableOpacity>
  
        {/* LISTA DE USUÁRIOS */}
        <Text style={styles.tituloSecao}>Usuários Cadastrados</Text>
        
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemLista}>
              <View>
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemDetalhes}>
                  Matrícula: {item.matricula} | Saldo: R$ {item.saldo?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.editarButton}
                onPress={() => {/* Função editar */}}
              >
                <Text style={styles.editarText}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }

  function GerenciarProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({
      nome: '',
      preco: '',
      descricao: ''
    });
    const [carregando, setCarregando] = useState(false);
  
    // Funções similares às de usuários, mas para produtos
    const carregarProdutos = async () => {
      try {
        const { data, error } = await supabase
          .from('cantina_produtos')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        setProdutos(data || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os produtos');
      }
    };
  
    const cadastrarProduto = async () => {
      if (!formData.nome || !formData.preco) {
        Alert.alert('Erro', 'Preencha nome e preço');
        return;
      }
  
      setCarregando(true);
      try {
        const { data, error } = await supabase
          .from('cantina_produtos')
          .insert([
            {
              nome: formData.nome,
              preco: parseFloat(formData.preco),
              descricao: formData.descricao || ''
            }
          ])
          .select();
  
        if (error) throw error;
  
        Alert.alert('Sucesso', 'Produto cadastrado!');
        setFormData({ nome: '', preco: '', descricao: '' });
        carregarProdutos();
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível cadastrar o produto');
      } finally {
        setCarregando(false);
      }
    };
  
    useEffect(() => {
      carregarProdutos();
    }, []);
  
    return (
      <View style={styles.abaConteudo}>
        <Text style={styles.tituloSecao}>Cadastrar Novo Produto</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          value={formData.nome}
          onChangeText={(text) => setFormData({...formData, nome: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Preço (ex: 5.50)"
          keyboardType="numeric"
          value={formData.preco}
          onChangeText={(text) => setFormData({...formData, preco: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Descrição (opcional)"
          value={formData.descricao}
          onChangeText={(text) => setFormData({...formData, descricao: text})}
        />
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, carregando && styles.buttonDisabled]}
          onPress={cadastrarProduto}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>
            {carregando ? 'Cadastrando...' : '🛍️ Cadastrar Produto'}
          </Text>
        </TouchableOpacity>
  
        {/* LISTA DE PRODUTOS */}
        <Text style={styles.tituloSecao}>Produtos Cadastrados</Text>
        
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemLista}>
              <View>
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemDetalhes}>
                  Preço: R$ {item.preco?.toFixed(2)} | {item.descricao || 'Sem descrição'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.editarButton}
                onPress={() => {/* Função editar */}}
              >
                <Text style={styles.editarText}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#005CA9', // Azul SENAI
      padding: 20,
      paddingTop: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    voltarButton: {
      padding: 8,
    },
    voltarText: {
      color: '#fff',
      fontSize: 16,
    },
    abasContainer: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      padding: 8,
    },
    aba: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    abaAtiva: {
      backgroundColor: '#005CA9',
    },
    abaTexto: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
    },
    abaTextoAtiva: {
      color: '#fff',
    },
    conteudo: {
      flex: 1,
      padding: 16,
    },
    abaConteudo: {
      flex: 1,
    },
    tituloSecao: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',
    },
    input: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
    },
    button: {
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    primaryButton: {
      backgroundColor: '#005CA9',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    itemLista: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemNome: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    itemDetalhes: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    editarButton: {
      padding: 8,
      backgroundColor: '#FF6B35', // Laranja SENAI
      borderRadius: 4,
    },
    editarText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });