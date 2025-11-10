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
  const [criandoTicket, setCriandoTicket] = useState(false);

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const limparCampos = () => {
    setNome('');
    setMatricula('');
    setErrors({});
  };

  // Função auxiliar para criar ticket gratuito
  async function criarTicketGratuitoAoLogar(usuario) {
    try {
      setCriandoTicket(true);
      // Busca o produto padrão para ticket (primeiro da lista)
      const { data: produtoPadrao, error: prodError } = await supabase
        .from('cantina_produtos')
        .select('id, nome, preco, codigo')
        .limit(1)
        .single();

      if (prodError || !produtoPadrao) {
        Alert.alert('Erro', 'Não foi possível criar seu vale grátis (produto não encontrado).');
        setCriandoTicket(false);
        return null;
      }

      // Cria o ticket gratuito
      const ticketCode = `TKT-GRATIS-LOGIN-${usuario.id}-${Date.now()}`;
      const { error: ticketError } = await supabase
        .from('cantina_tickets')
        .insert([{
          produto_id: produtoPadrao.id,
          usuario_id: usuario.id,
          ticket_code: ticketCode,
          gratuito: true,
          status: 'ativo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          qr_data: JSON.stringify({
            ticketId: ticketCode,
            produtoId: produtoPadrao.id,
            produtoNome: produtoPadrao.nome,
            produtoCodigo: produtoPadrao.codigo,
            usuarioId: usuario.id,
            dataEmissao: new Date().toISOString(),
            valor: 0
          })
        }]);

      if (ticketError) {
        console.log('bbbb');
        console.log(ticketError);
        Alert.alert('Erro ao criar ticket', 'Pode ser regra de segurança (RLS) bloqueando vale. Chame um admin!');
        setCriandoTicket(false);
        return null;
      }
      setCriandoTicket(false);
      Alert.alert('🎫 Vale resgatado!', `Você já ganhou seu vale grátis para ${produtoPadrao.nome}.`);
    } catch (error) {
      setCriandoTicket(false);
      Alert.alert('Falha ao criar vale', error.message);
      return null;
    }
  }

  // Função de login, adaptada para criar ticket após login
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
          setErrors({ geral: `Erro: ${error.message}` });
          return;
        }

        if (data && data.length > 0) {
          // Criar ticket gratuito no login (se usuário existe)
          await criarTicketGratuitoAoLogar(data[0]);

          // Navega para Home normalmente
          navigation.navigate('Home', { usuario: data[0] });
        } else {
          setErrors({ geral: 'Nome ou matrícula incorretos. Verifique os dados.' });
        }
      } catch (error) {
        setErrors({ geral: 'Erro de conexão' });
      }
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkGradientBackground : styles.lightGradientBackground]}>
      <ScrollView style={styles.scrollView}>
        

        <View style={[styles.tituloContainer]}>
          <Text style={[styles.tituloLogin]}>
            Login
          </Text>
        </View>

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
          {criandoTicket && (
            <Text style={styles.infoTicket}>Resgatando vale gratuito...</Text>
          )}

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleCadastrar} disabled={criandoTicket}>
            <Text style={styles.buttonText}> Entrar no Sistema</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={limparCampos} disabled={criandoTicket}>
            <Text style={styles.buttonText}> Limpar Campos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightGradientBackground: {
    backgroundColor: '#3B82F6',
  },
  darkGradientBackground: {
    backgroundColor: '#1E3A8A',
  },
  scrollView: {
    flex: 1,
    padding: 24,
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
  infoTicket: {
    color: '#FFF91C',
    marginBottom: 8,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
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
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});