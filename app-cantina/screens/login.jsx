import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/database';

export default function Login() {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [errors, setErrors] = useState({});

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const limparCampos = () => {
    setNome('');
    setMatricula('');
    setErrors({});
  };

  const handleCadastrar = async () => {
    const novosErros = {};

    if (!validarNome(nome)) novosErros.nome = 'Nome inválido. Use apenas letras e espaços.';
    if (!validarMatricula(matricula))
      novosErros.matricula = 'Matrícula inválida. Deve ter pelo menos 6 números.';

    setErrors(novosErros);

    if (Object.keys(novosErros).length === 0) {
      // Consulta o banco de dados
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('matricula', matricula);

      if (error) {
        console.log('Erro no banco:', error.message);
        setErrors({ matricula: 'Erro de conexão' });
        return;
      }

      if (data && data.length > 0) {
        // Usuário encontrado - vai para Home
        navigation.navigate('Home');
      } else {
        // Usuário não encontrado
        setErrors({ matricula: 'Matrícula não encontrada' });
      }
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, isDarkMode && styles.darkText]}>
          Modo Escuro
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={() => setIsDarkMode((prev) => !prev)}
          thumbColor={isDarkMode ? '#fff' : '#007AFF'}
          trackColor={{ false: '#ccc', true: '#444' }}
        />
      </View>

      <Text style={[styles.title, isDarkMode && styles.darkText]}>Cadastro</Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Nome"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={nome}
        onChangeText={setNome}
      />
      {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Matrícula"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        keyboardType="numeric"
        value={matricula}
        onChangeText={setMatricula}
      />
      {errors.matricula && <Text style={styles.error}>{errors.matricula}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleCadastrar}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={limparCampos}>
        <Text style={styles.buttonText}>Limpar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  switchContainer: {
    position: 'absolute',
    top: 50,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  darkInput: {
    backgroundColor: '#1e1e1e',
    borderColor: '#444',
    color: '#fff',
  },
  error: {
    color: '#ff4d4d',
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});