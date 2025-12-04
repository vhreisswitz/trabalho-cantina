import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/database';

export default function Login() {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [errors, setErrors] = useState({});
  const [criandoTicket, setCriandoTicket] = useState(false);

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const limparCampos = () => {
    setNome('');
    setMatricula('');
    setErrors({});
  };

  async function criarTicketGratuitoAoLogar(usuario) {
    try {
      setCriandoTicket(true);
      const { data: produtoPadrao, error: prodError } = await supabase
        .from('cantina_produtos')
        .select('id, nome, preco, codigo')
        .limit(1)
        .single();

      if (prodError || !produtoPadrao) {
        Alert.alert('Erro', 'Não foi possível criar seu vale grátis.');
        setCriandoTicket(false);
        return null;
      }

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
        Alert.alert('Erro ao criar ticket', 'RLS pode estar bloqueando.');
        setCriandoTicket(false);
        return null;
      }

      setCriandoTicket(false);
      Alert.alert('🎫 Vale criado!', `Você ganhou um vale para ${produtoPadrao.nome}.`);

    } catch (error) {
      setCriandoTicket(false);
      Alert.alert('Falha ao criar vale', error.message);
      return null;
    }
  }

  const handleCadastrar = async () => {
    const novosErros = {};

    if (!validarNome(nome)) novosErros.nome = 'Nome inválido.';
    if (!validarMatricula(matricula)) novosErros.matricula = 'Matrícula inválida.';

    setErrors(novosErros);

    if (Object.keys(novosErros).length === 0) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('matricula', matricula)
          .ilike('nome', `%${nome}%`);

        if (error) {
          setErrors({ geral: `Erro: ${error.message}` });
          return;
        }

        if (data && data.length > 0) {
          const usuario = data[0];

          await AsyncStorage.setItem('userId', usuario.id.toString());
          await AsyncStorage.setItem('userData', JSON.stringify(usuario));

          if (usuario.tipo === 'admin') {
            navigation.navigate('AdminDashboard', { usuario });
          } else {
            await criarTicketGratuitoAoLogar(usuario);
            navigation.navigate('Home', { usuario });
          }
        } else {
          setErrors({ geral: 'Nome ou matrícula incorretos.' });
        }
      } catch (error) {
        setErrors({ geral: 'Erro de conexão.' });
      }
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBG : styles.lightBG]}>
      <ScrollView style={styles.scrollView}>

        <View style={styles.headerContainer}>
          <Image
            source={{ uri: 'https://logodownload.org/wp-content/uploads/2019/08/senai-logo-1.png' }}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        <View style={styles.loginWrapper}>
          <Text style={styles.sectionTitle}></Text>

          <TextInput
            style={[styles.input]}
            placeholder="Nome"
            placeholderTextColor="#8BA3C7"
            value={nome}
            onChangeText={setNome}
          />
          {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

          <TextInput
            style={[styles.input]}
            placeholder="Matrícula"
            placeholderTextColor="#8BA3C7"
            keyboardType="numeric"
            value={matricula}
            onChangeText={setMatricula}
          />
          {errors.matricula && <Text style={styles.error}>{errors.matricula}</Text>}

          {errors.geral && <Text style={styles.error}>{errors.geral}</Text>}
          {criandoTicket && <Text style={styles.info}>Gerando vale gratuito...</Text>}

          <TouchableOpacity style={[styles.button, styles.primaryBtn]} onPress={handleCadastrar}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryBtn]} onPress={limparCampos}>
            <Text style={styles.buttonText}>Limpar Campos</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightBG: { backgroundColor: '#2563EB' },
  darkBG: { backgroundColor: '#1E293B' },
  scrollView: { flex: 1, padding: 28 },
  headerContainer: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  logo: { width: 190, height: 60, resizeMode: 'contain', marginBottom: 10 },
  headerTitle: { fontSize: 36, fontWeight: '99', color: '#FFFFFF', letterSpacing: 4 },
  loginWrapper: { width: '100%' },
  sectionTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 30, color: '#FFFFFF' },
  input: { height: 58, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 18, marginBottom: 16, fontSize: 17, color: '#FFFFFF', fontWeight: '500' },
  error: { color: '#FF6B6B', marginBottom: 12, marginLeft: 6, fontSize: 14, fontWeight: '600' },
  info: { color: '#FFF93B', marginBottom: 14, marginLeft: 6, fontSize: 14, fontWeight: '600' },
  button: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  primaryBtn: { backgroundColor: '#1E40AF' },
  secondaryBtn: { backgroundColor: '#475569' },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '800' }
});