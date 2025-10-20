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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const usuarioSimulado = {
        id: 1,
        nome: formData.nome,
        matricula: formData.matricula,
        senha: '••••••',
        criado_em: new Date().toISOString()
      };

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
          style={[styles.button, styles.verificarButton, carregando && styles.buttonDisabled]} 
          onPress={verificarUsuario}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>
            {carregando ? '🔎 Verificando...' : '📋 Verificar Usuário'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.limparButton, carregando && styles.buttonDisabled]} 
          onPress={limparVerificacao}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>🔄 Limpar</Text>
        </TouchableOpacity>
      </View>

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
  const [abaAtiva, setAbaAtiva] = useState('login');

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
    <View style={[styles.container, isDarkMode ? styles.darkGradientBackground : styles.lightGradientBackground]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, isDarkMode && styles.darkText]}>
            {isDarkMode ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={() => setIsDarkMode((prev) => !prev)}
            thumbColor={isDarkMode ? '#fff' : '#007AFF'}
            trackColor={{ false: '#ccc', true: '#4F46E5' }}
          />
        </View>

        {/* Abas de Navegação */}
        <View style={[styles.abasContainer, isDarkMode && styles.darkAbasContainer]}>
          <TouchableOpacity 
            style={[styles.aba, abaAtiva === 'login' && styles.abaAtiva]}
            onPress={() => setAbaAtiva('login')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'login' && styles.abaTextoAtiva]}>
              🔐 Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.aba, abaAtiva === 'verificar' && styles.abaAtiva]}
            onPress={() => setAbaAtiva('verificar')}
          >
            <Text style={[styles.abaTexto, abaAtiva === 'verificar' && styles.abaTextoAtiva]}>
              🔍 Verificar
            </Text>
          </TouchableOpacity>
        </View>

        {abaAtiva === 'login' ? (
          <View style={styles.loginContainer}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              🚀 Sistema de Acesso
            </Text>

            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Nome completo"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              value={nome}
              onChangeText={setNome}
            />
            {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Número da matrícula"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              keyboardType="numeric"
              value={matricula}
              onChangeText={setMatricula}
            />
            {errors.matricula && <Text style={styles.error}>{errors.matricula}</Text>}

            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleCadastrar}>
              <Text style={styles.buttonText}>🎯 Entrar no Sistema</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={limparCampos}>
              <Text style={styles.buttonText}>🧹 Limpar Campos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <VerificarUsuario isDarkMode={isDarkMode} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightGradientBackground: {
    backgroundColor: '#3B82F6', // Azul sólido para modo claro
  },
  darkGradientBackground: {
    backgroundColor: '#1E3A8A', // Azul escuro sólido para modo escuro
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  abasContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  darkAbasContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  aba: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  abaAtiva: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  abaTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  abaTextoAtiva: {
    color: '#fff',
    fontWeight: '700',
  },
  loginContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  darkText: {
    color: '#fff',
  },
  input: {
    height: 56,
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 12,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    borderRadius: 12,
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  verificarButton: {
    backgroundColor: '#10B981',
  },
  limparButton: {
    backgroundColor: '#6B7280',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Estilos para o componente de verificação
  verificacaoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  darkVerificacaoContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  verificacaoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  verificacaoBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resultadoContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoSucesso: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    borderColor: 'rgba(21, 128, 61, 0.5)',
  },
  resultadoErro: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderColor: 'rgba(185, 28, 28, 0.5)',
  },
  resultadoAlerta: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    borderColor: 'rgba(180, 83, 9, 0.5)',
  },
  resultadoMensagem: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center',
  },
  detalhesUsuario: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  detalhesTexto: {
    fontSize: 14,
    marginBottom: 6,
    color: '#fff',
    fontWeight: '500',
  },
  detalhesLabel: {
    fontWeight: 'bold',
    color: '#E5E7EB',
  },
});