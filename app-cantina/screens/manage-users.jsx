import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { adminFunctions } from '../services/database';

export default function ManageUsers() {
  const navigation = useNavigation();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    email: '',
    tipo: 'student',
    saldo: ''
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await adminFunctions.getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Falha ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      matricula: '',
      email: '',
      tipo: 'student',
      saldo: ''
    });
    setModoEdicao(false);
    setUsuarioEditando(null);
  };

  const handleSalvarUsuario = async () => {
    if (!formData.nome || !formData.matricula) {
      Alert.alert('Erro', 'Preencha nome e matrícula');
      return;
    }

    try {
      console.log('Tentando salvar usuário:', formData);

      if (modoEdicao && usuarioEditando) {
        console.log('Atualizando usuário ID:', usuarioEditando.id);
        await adminFunctions.atualizarUsuario(usuarioEditando.id, {
          ...formData,
          saldo: parseFloat(formData.saldo) || 0
        });
        Alert.alert('Sucesso', 'Usuário atualizado!');
      } else {
        console.log('Adicionando novo usuário');
        await adminFunctions.adicionarUsuario({
          ...formData,
          saldo: parseFloat(formData.saldo) || 0
        });
        Alert.alert('Sucesso', 'Usuário adicionado!');
      }
      
      limparFormulario();
      carregarUsuarios();
    } catch (error) {
      console.error('ERRO ao salvar usuário:', error);
      Alert.alert('Erro', `Falha ao salvar usuário: ${error.message}`);
    }
  };

  const handleEditar = (usuario) => {
    setFormData({
      nome: usuario.nome,
      matricula: usuario.matricula,
      email: usuario.email || '',
      tipo: usuario.tipo || 'student',
      saldo: usuario.saldo?.toString() || '0'
    });
    setModoEdicao(true);
    setUsuarioEditando(usuario);
  };

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
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {modoEdicao ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </Text>

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
            placeholder="Email (opcional)"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Saldo inicial"
            keyboardType="numeric"
            value={formData.saldo}
            onChangeText={(text) => setFormData({...formData, saldo: text})}
          />

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Tipo de Usuário:</Text>
            <View style={styles.radioOptions}>
              <TouchableOpacity 
                style={[styles.radioOption, formData.tipo === 'student' && styles.radioSelected]}
                onPress={() => setFormData({...formData, tipo: 'student'})}
              >
                <Text style={[styles.radioText, formData.tipo === 'student' && styles.radioTextSelected]}>
                  Aluno
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.radioOption, formData.tipo === 'admin' && styles.radioSelected]}
                onPress={() => setFormData({...formData, tipo: 'admin'})}
              >
                <Text style={[styles.radioText, formData.tipo === 'admin' && styles.radioTextSelected]}>
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleSalvarUsuario}
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
          <Text style={styles.listaTitle}>Usuários Cadastrados</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#005CA9" />
          ) : (
            <View>
              {usuarios.map((item) => (
                <View key={item.id.toString()} style={styles.usuarioItem}>
                  <View style={styles.usuarioInfo}>
                    <Text style={styles.usuarioNome}>{item.nome}</Text>
                    <Text style={styles.usuarioMatricula}>Matrícula: {item.matricula}</Text>
                    <Text style={styles.usuarioTipo}>
                      Tipo: {item.tipo === 'admin' ? 'Administrador' : 'Aluno'}
                    </Text>
                    <Text style={styles.usuarioSaldo}>Saldo: R$ {item.saldo || 0}</Text>
                    {item.email && (
                      <Text style={styles.usuarioEmail}>Email: {item.email}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditar(item)}
                  >
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
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
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  radioOptions: {
    flexDirection: 'row',
  },
  radioOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  radioSelected: {
    backgroundColor: '#005CA9',
    borderColor: '#005CA9',
  },
  radioText: {
    fontWeight: '600',
    color: '#333',
  },
  radioTextSelected: {
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
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
  usuarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usuarioMatricula: {
    fontSize: 14,
    color: '#666',
  },
  usuarioTipo: {
    fontSize: 14,
    color: '#666',
  },
  usuarioSaldo: {
    fontSize: 14,
    color: '#005CA9',
    fontWeight: '600',
  },
  usuarioEmail: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});