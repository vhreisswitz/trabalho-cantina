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

// Dados mock para desenvolvimento
const mockUsuarios = [
  {
    id: '1',
    nome: 'Victor Hugo',
    matricula: '2023001',
    created_at: new Date().toISOString()
  },
  {
    id: '2', 
    nome: 'Kauan',
    matricula: '2023002',
    created_at: new Date().toISOString()
  },
  {
  id: '3', 
  nome: 'Wesley',
  matricula: '2023003',
  created_at: new Date().toISOString()
},
];

// Componente de Verificação de Usuário
function VerificarUsuario({ isDarkMode }) {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: ''
  });
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [modoOffline, setModoOffline] = useState(false);

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FUNÇÃO DE TESTE DA CONEXÃO
  const testarConexao = async () => {
    console.log('🔍 Testando conexão com Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .limit(1);

      if (error) {
        console.log('❌ Erro na conexão:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        Alert.alert('Erro Conexão', 
          `Code: ${error.code}\nMessage: ${error.message}`
        );
      } else {
        console.log('✅ Conexão OK! Dados:', data);
        Alert.alert('Conexão OK', `Encontrados ${data?.length || 0} usuários`);
      }
    } catch (err) {
      console.log('💥 Erro geral:', err);
      Alert.alert('Erro', err.message);
    }
  };

  // 🆕 FUNÇÃO DE TESTE DE CONECTIVIDADE DE REDE
  const testarConectividadeRede = async () => {
    console.log('🌐 Testando conectividade de rede...');
    
    const testes = [
      'https://google.com',
      'https://github.com', 
      'https://aokmqmjavidwfxceehvs.supabase.co',
      'https://aokmqmjavidwfxceehvs.supabase.co/rest/v1/'
    ];

    let resultados = '📡 Resultados dos Testes de Rede:\n\n';

    for (const url of testes) {
      try {
        const start = Date.now();
        const response = await fetch(url, { method: 'HEAD' });
        const tempo = Date.now() - start;
        
        console.log(`✅ ${url} - Status: ${response.status} (${tempo}ms)`);
        resultados += `✅ ${url}\nStatus: ${response.status} (${tempo}ms)\n\n`;
      } catch (error) {
        console.log(`❌ ${url} - Erro: ${error.message}`);
        resultados += `❌ ${url}\nErro: ${error.message}\n\n`;
      }
    }

    Alert.alert('Teste de Rede', resultados);
  };

  // 🆕 FUNÇÃO MOCK PARA MODO OFFLINE
  const verificarUsuarioMock = async (formData) => {
    console.log('🔧 Usando dados mock (modo offline)');
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const usuario = mockUsuarios.find(u => 
      u.matricula === formData.matricula && 
      u.nome.toLowerCase().includes(formData.nome.toLowerCase())
    );
    
    return usuario ? { data: [usuario], error: null } : { data: [], error: null };
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
      console.log('🟡 Iniciando consulta...', formData);
      console.log('🔧 Modo:', modoOffline ? 'OFFLINE' : 'ONLINE');

      let data, error;

      if (modoOffline) {
        // Usa dados mock
        const result = await verificarUsuarioMock(formData);
        data = result.data;
        error = result.error;
      } else {
        // Consulta real no Supabase
        const result = await supabase
          .from('usuarios')
          .select('*')
          .eq('matricula', formData.matricula);
        data = result.data;
        error = result.error;
      }

      console.log('🟢 Resposta completa:', { 
        data: data, 
        error: error 
      });

      if (error) {
        console.log('🔴 Detalhes do erro:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        setResultado({
          status: 'ERRO',
          mensagem: `Erro: ${error.code || 'ERRO'} - ${error.message}`,
          usuario: null
        });
        return;
      }

      if (data && data.length > 0) {
        const usuarioEncontrado = data[0];
        console.log('✅ Usuário encontrado:', usuarioEncontrado);
        
        setResultado({
          status: 'ENCONTRADO',
          mensagem: `✅ Usuário encontrado com sucesso! ${modoOffline ? '(Modo Offline)' : ''}`,
          usuario: {
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            matricula: usuarioEncontrado.matricula,
            senha: '••••••',
            criado_em: usuarioEncontrado.created_at || usuarioEncontrado.criado_em || new Date().toISOString()
          }
        });
      } else {
        console.log('🔵 Nenhum usuário encontrado');
        setResultado({
          status: 'NAO_ENCONTRADO',
          mensagem: `❌ Usuário não encontrado! ${modoOffline ? '(Modo Offline)' : ''}`,
          usuario: null
        });
      }

    } catch (err) {
      console.error('💥 Erro inesperado:', err);
      setResultado({
        status: 'ERRO',
        mensagem: `Erro interno: ${err.message}`,
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

      {/* 🆕 INDICADOR DE MODO */}
      <View style={styles.modoContainer}>
        <Text style={[styles.modoTexto, isDarkMode && styles.darkText]}>
          Modo: {modoOffline ? '🔧 Offline (Mock)' : '🌐 Online (Supabase)'}
        </Text>
        <TouchableOpacity 
          style={[styles.button, {backgroundColor: modoOffline ? '#ffa500' : '#007AFF', padding: 8}]}
          onPress={() => setModoOffline(!modoOffline)}
        >
          <Text style={[styles.buttonText, {fontSize: 12}]}>
            {modoOffline ? '🔄 Tentar Conexão Real' : '🔧 Usar Dados Mock'}
          </Text>
        </TouchableOpacity>
      </View>

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

      {/* BOTÕES DE TESTE */}
      <TouchableOpacity 
        style={[styles.button, {backgroundColor: 'orange', marginTop: 10}]} 
        onPress={testarConexao}
      >
        <Text style={styles.buttonText}>Testar Conexão Supabase</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, {backgroundColor: 'purple', marginTop: 10}]} 
        onPress={testarConectividadeRede}
      >
        <Text style={styles.buttonText}>Testar Conectividade de Rede</Text>
      </TouchableOpacity>

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

// Componente Principal Login
export default function Login() {
  const navigation = useNavigation();
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

  const handleCadastrar = async () => {
    const novosErros = {};

    if (!validarNome(nome)) novosErros.nome = 'Nome inválido. Use apenas letras e espaços.';
    if (!validarMatricula(matricula))
      novosErros.matricula = 'Matrícula inválida. Deve ter pelo menos 6 números.';

    setErrors(novosErros);

    if (Object.keys(novosErros).length === 0) {
      try {
        console.log('🟡 Fazendo login...', { matricula });
        
        // Consulta o banco de dados
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('matricula', matricula);

        console.log('🟢 Resposta login:', { data, error });

        if (error) {
          console.log('🔴 Erro login:', error);
          setErrors({ matricula: `Erro: ${error.message}` });
          return;
        }

        if (data && data.length > 0) {
          // Usuário encontrado - vai para Home
          console.log('✅ Login bem-sucedido!');
          navigation.navigate('Home');
        } else {
          // Usuário não encontrado
          console.log('🔵 Usuário não encontrado');
          setErrors({ matricula: 'Matrícula não encontrada' });
        }
      } catch (error) {
        console.log('💥 Erro geral login:', error);
        setErrors({ matricula: 'Erro de conexão' });
      }
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

// Estilos
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
  // 🆕 ESTILOS PARA O MODO
  modoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  modoTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});