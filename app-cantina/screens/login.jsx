import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { supabase } from '../services/database';

// Componente de Verificação de Usuário
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função que simula a verificação no banco (substitua pela chamada real do Supabase)
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
    setResultado(null);

    try {
      // SIMULAÇÃO - SUBSTITUA POR CHAMADA REAL DO SUPABASE
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Exemplo de resposta simulada
      const usuarioSimulado = {
        id: 1,
        nome: formData.nome,
        matricula: formData.matricula,
        senha: '••••••',
        criado_em: new Date().toISOString()
      };

      // Simula usuário encontrado (50% de chance)
      const encontrado = Math.random() > 0.5;

      if (encontrado) {
        setResultado({
          status: 'ENCONTRADO',
          mensagem: '✅ Usuário encontrado com sucesso!',
          usuario: usuarioSimulado
        });
      } else {
        setResultado({
          status: 'NAO_ENCONTRADO',
          mensagem: '❌ Usuário não encontrado!',
          usuario: null
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setResultado({
        status: 'ERRO',
        mensagem: 'Erro interno do sistema',
        usuario: null
      });
    } finally {
      setCarregando(false);
    }
  }

  const limparVerificacao = () => {
    setFormData({ nome: '', matricula: '' });
    setResultado(null);
  };

  return (
    <View style={[styles.verificacaoContainer, isDarkMode && styles.darkVerificacaoContainer]}>
      <Text style={[styles.verificacaoTitle, isDarkMode && styles.darkText]}>
        🔍 Verificar Usuário
      </Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Nome para verificar"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={formData.nome}
        onChangeText={(value) => handleInputChange('nome', value)}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Matrícula para verificar"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        keyboardType="numeric"
        value={formData.matricula}
        onChangeText={(value) => handleInputChange('matricula', value)}
      />

      <View style={styles.verificacaoBotoes}>
        <TouchableOpacity 
          style={[styles.button, styles.verificarButton]} 
          onPress={verificarUsuario}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>
            {carregando ? '🔎 Verificando...' : 'Verificar Usuário'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.limparButton]} 
          onPress={limparVerificacao}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Resultado da verificação */}
      {resultado && (
        <View style={[
          styles.resultadoContainer,
          resultado.status === 'ENCONTRADO' && styles.resultadoSucesso,
          resultado.status === 'NAO_ENCONTRADO' && styles.resultadoErro,
          resultado.status === 'ERRO' && styles.resultadoAlerta,
        ]}>
          <Text style={styles.resultadoMensagem}>{resultado.mensagem}</Text>
          
          {resultado.usuario && (
            <View style={styles.detalhesUsuario}>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>ID:</Text> {resultado.usuario.id}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Nome:</Text> {resultado.usuario.nome}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Matrícula:</Text> {resultado.usuario.matricula}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Cadastrado em:</Text> {' '}
                {new Date(resultado.usuario.criado_em).toLocaleString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function Login() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [errors, setErrors] = useState({});
  const [abaAtiva, setAbaAtiva] = useState('login'); // 'login' ou 'verificar'

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const limparCampos = () => {
    setNome('');
    setMatricula('');
    setErrors({});
  };

  const handleCadastrar = () => {
    const novosErros = {};

    if (!validarNome(nome)) novosErros.nome = 'Nome inválido. Use apenas letras e espaços.';
    if (!validarMatricula(matricula))
      novosErros.matricula = 'Matrícula inválida. Deve ter pelo menos 6 números.';

    setErrors(novosErros);

    if (Object.keys(novosErros).length === 0) {
      Alert.alert('Entrou com sucesso!', `Nome: ${nome}\nMatrícula: ${matricula}`);
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
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

      {/* Abas de Navegação */}
      <View style={styles.abasContainer}>
        <TouchableOpacity 
          style={[styles.aba, abaAtiva === 'login' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('login')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'login' && styles.abaTextoAtiva]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.aba, abaAtiva === 'verificar' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('verificar')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'verificar' && styles.abaTextoAtiva]}>
            Verificar
          </Text>
        </TouchableOpacity>
      </View>

      {abaAtiva === 'login' ? (
        <View style={styles.loginContainer}>
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
      ) : (
        <VerificarUsuario isDarkMode={isDarkMode} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
  },
  abasContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  aba: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  abaAtiva: {
    backgroundColor: '#007AFF',
  },
  abaTexto: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  abaTextoAtiva: {
    color: '#fff',
  },
  loginContainer: {
    justifyContent: 'center',
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
  // Estilos para o componente de verificação
  verificacaoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  darkVerificacaoContainer: {
    backgroundColor: '#1e1e1e',
  },
  verificacaoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  verificacaoBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  verificarButton: {
    flex: 2,
    backgroundColor: '#28a745',
  },
  limparButton: {
    flex: 1,
    backgroundColor: '#6c757d',
  },
  resultadoContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultadoSucesso: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  resultadoErro: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  resultadoAlerta: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  resultadoMensagem: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  detalhesUsuario: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
  },
  detalhesTexto: {
    fontSize: 14,
    marginBottom: 4,
  },
  detalhesLabel: {
    fontWeight: 'bold',
  },
});