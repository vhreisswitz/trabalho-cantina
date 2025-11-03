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



export default function Login() {
  const navigation = useNavigation();
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

  const handleCadastrar = async () => {
    const novosErros = {};

    if (!validarNome(nome)) novosErros.nome = 'Nome inválido. Use apenas letras e espaços.';
    if (!validarMatricula(matricula))
      novosErros.matricula = 'Matrícula inválida. Deve ter pelo menos 6 números.';

    setErrors(novosErros);

    if (Object.keys(novosErros).length === 0) {
      try {
        console.log('Fazendo login...', { nome, matricula });

        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('matricula', matricula)
          .ilike('nome', `%${nome}%`);

        console.log('Resposta login:', { data, error });

        if (error) {
          console.log('Erro login:', error);
          setErrors({ geral: `Erro: ${error.message}` });
          return;
        }

        if (data && data.length > 0) {
          console.log('Login bem-sucedido!');
          navigation.navigate('Home', { usuario: data[0] });
        } else {
          console.log('Usuário não encontrado');
          setErrors({ geral: 'Nome ou matrícula incorretos. Verifique os dados.' });
        }
      } catch (error) {
        console.log('Erro geral login:', error);
        setErrors({ geral: 'Erro de conexão' });
      }
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkGradientBackground : styles.lightGradientBackground]}>
      <ScrollView style={styles.scrollView}>
        {/* <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, isDarkMode && styles.darkText]}>
            {isDarkMode ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={() => setIsDarkMode((prev) => !prev)}
            thumbColor={isDarkMode ? '#fff' : '#007AFF'}
            trackColor={{ false: '#ccc', true: '#4F46E5' }}
          />
        </View> */}

        {/* <View style={styles.abasContainer}>
          <TouchableOpacity
            style={[styles.aba, abaAtiva === 'login' && styles.abaAtiva]}
            onPress={() => setAbaAtiva('login')}
          > */}

            <View style={[styles.tituloContainer]}>
            <Text style={[styles.tituloLogin]}>
              Login
            </Text>
            </View>


          {/* </TouchableOpacity> */}

          {/* <TouchableOpacity 
          style={[styles.aba, abaAtiva === 'verificar' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('verificar')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'verificar' && styles.abaTextoAtiva]}>
            Verificar
          </Text>
        </TouchableOpacity> */}

        {/* </View> */}

        {abaAtiva === 'login' ? (
          <View style={styles.loginContainer}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              Sistema de Acesso
            </Text>

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

            {errors.geral && <Text style={styles.error}>{errors.geral}</Text>}

            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleCadastrar}>
              <Text style={styles.buttonText}> Entrar no Sistema</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={limparCampos}>
              <Text style={styles.buttonText}> Limpar Campos</Text>
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
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  abaTextoAtiva: {
    justifyContent: 'center',
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
  },
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
  tituloContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  tituloLogin: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});