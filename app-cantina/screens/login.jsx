import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/database';

function VerificarUsuario({ isDarkMode }) {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: ''
  });
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function verificarUsuario() {
    if (!formData.nome || !formData.matricula) {
      Alert.alert('Erro', 'Por favor, preencha nome e matrícula!');
      return;
    }

    if (!validarNome(formData.nome) || !validarMatricula(formData.matricula)) {
      Alert.alert('Erro', 'Por favor, verifique os campos!');
      return;
    }

    setCarregando(true);

    try {
      // CONSULTA REAL NO SUPABASE - REMOVIDA A SIMULAÇÃO
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('matricula', formData.matricula)
        .ilike('nome', `%${formData.nome.trim()}%`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setResultado({
            status: 'NAO_ENCONTRADO',
            mensagem: '❌ Usuário não encontrado!',
            usuario: null
          });
        } else {
          console.error('Erro na consulta:', error);
          setResultado({
            status: 'ERRO',
            mensagem: `Erro na consulta: ${error.message}`,
            usuario: null
          });
        }
        return;
      }

      if (data) {
        setResultado({
          status: 'ENCONTRADO',
          mensagem: '✅ Usuário encontrado com sucesso!',
          usuario: {
            id: data.id,
            nome: data.nome,
            matricula: data.matricula,
            senha: '••••••',
            criado_em: data.created_at || data.criado_em || new Date().toISOString()
          }
        });
      } else {
        setResultado({
          status: 'NAO_ENCONTRADO',
          mensagem: '❌ Usuário não encontrado!',
          usuario: null
        });
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao verificar o usuário.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        value={formData.nome}
        onChangeText={(text) => handleInputChange('nome', text)}
      />

      <Text style={styles.label}>Matrícula:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite sua matrícula"
        keyboardType="numeric"
        value={formData.matricula}
        onChangeText={(text) => handleInputChange('matricula', text)}
      />

      <Button
        title={carregando ? 'Verificando...' : 'Entrar'}
        onPress={verificarUsuario}
        disabled={carregando}
      />

      {resultado && (
        <View style={styles.resultado}>
          <Text>{resultado.mensagem}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  resultado: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
});