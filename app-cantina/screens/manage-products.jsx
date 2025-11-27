import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { adminFunctions } from '../services/database';

export default function ManageProducts() {
  const navigation = useNavigation();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    codigo: '',
    descricao: '',
    disponivel: true
  });

  useEffect(() => {
    console.log('🚀 Inicializando ManageProducts como admin');
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const produtosData = await adminFunctions.getProdutos();
      setProdutos(produtosData);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      preco: '',
      codigo: '',
      descricao: '',
      disponivel: true
    });
    setModoEdicao(false);
    setProdutoEditando(null);
  };

  const handleSalvarProduto = async () => {
    if (!formData.nome || !formData.preco || !formData.codigo) {
      Alert.alert('Erro', 'Preencha nome, preço e código');
      return;
    }

    try {
      console.log('🔄 Tentando salvar produto:', formData);
      
      const produtoParaSalvar = {
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        codigo: formData.codigo,
        descricao: formData.descricao || '',
        disponivel: formData.disponivel !== false
      };
      
      if (modoEdicao && produtoEditando) {
        console.log('📝 Editando produto ID:', produtoEditando.id);
        const resultado = await adminFunctions.atualizarProduto(produtoEditando.id, produtoParaSalvar);
        console.log('✅ Produto atualizado:', resultado);
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        console.log('➕ Adicionando novo produto');
        const resultado = await adminFunctions.adicionarProduto(produtoParaSalvar);
        console.log('✅ Produto adicionado:', resultado);
        Alert.alert('Sucesso', 'Produto adicionado!');
      }
      
      limparFormulario();
      carregarProdutos();
    } catch (error) {
      console.error('❌ Erro detalhado ao salvar produto:', error);
      Alert.alert('Erro', 'Falha ao salvar produto: ' + error.message);
    }
  };

  const handleEditar = (produto) => {
    setFormData({
      nome: produto.nome,
      preco: produto.preco.toString(),
      codigo: produto.codigo,
      descricao: produto.descricao || '',
      disponivel: produto.disponivel
    });
    setModoEdicao(true);
    setProdutoEditando(produto);
  };

  const handleExcluir = (produto) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o produto "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminFunctions.excluirProduto(produto.id);
              Alert.alert('Sucesso', 'Produto excluído!');
              carregarProdutos();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir produto');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.produtoItem}>
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoNome}>{item.nome}</Text>
        <Text style={styles.produtoPreco}>R$ {item.preco}</Text>
        <Text style={styles.produtoCodigo}>Código: {item.codigo}</Text>
        <Text style={styles.produtoStatus}>
          Status: {item.disponivel ? 'Disponível' : 'Indisponível'}
        </Text>
      </View>
      
      <View style={styles.produtoActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditar(item)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleExcluir(item)}
        >
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Produtos</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {modoEdicao ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </Text>

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
            placeholder="Código (ex: P001)"
            value={formData.codigo}
            onChangeText={(text) => setFormData({...formData, codigo: text})}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição (opcional)"
            multiline
            numberOfLines={3}
            value={formData.descricao}
            onChangeText={(text) => setFormData({...formData, descricao: text})}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleSalvarProduto}
            >
              <Text style={styles.buttonText}>
                {modoEdicao ? 'Atualizar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={limparFormulario}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listaContainer}>
          <Text style={styles.listaTitle}>Produtos Cadastrados</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#005CA9" />
          ) : (
            <FlatList
              data={produtos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              style={styles.flatList}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    backgroundColor: '#005CA9',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#005CA9',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listaContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  produtoPreco: {
    fontSize: 14,
    color: '#005CA9',
    fontWeight: '600',
  },
  produtoCodigo: {
    fontSize: 12,
    color: '#666',
  },
  produtoStatus: {
    fontSize: 12,
    color: '#666',
  },
  produtoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});