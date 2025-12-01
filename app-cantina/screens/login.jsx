import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/database';

export default function Login() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [errors, setErrors] = useState({});

  const nomeScale = useRef(new Animated.Value(1)).current;
  const matriculaScale = useRef(new Animated.Value(1)).current;

  const animarInput = (ref, tipo) => {
    Animated.spring(ref, {
      toValue: tipo === 'focus' ? 1.03 : 1,
      speed: 18,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const limparCampos = () => {
    setNome('');
    setMatricula('');
    setErrors({});
  };

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
          navigation.navigate('Home', { usuario: data[0] });
        } else {
          setErrors({ geral: 'Nome ou matrícula incorretos.' });
        }
      } catch (error) {
        setErrors({ geral: 'Erro de conexão' });
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollCenter}>
        <Text style={styles.titulo}>Login</Text>

        <View style={styles.card}>

          <Animated.View style={[styles.inputWrapper, { transform: [{ scale: nomeScale }] }]}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#94A3B8"
              value={nome}
              onChangeText={setNome}
              onFocus={() => animarInput(nomeScale, 'focus')}
              onBlur={() => animarInput(nomeScale, 'blur')}
            />
          </Animated.View>
          {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

          <Animated.View style={[styles.inputWrapper, { transform: [{ scale: matriculaScale }] }]}>
            <TextInput
              style={styles.input}
              placeholder="Matrícula"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={matricula}
              onChangeText={setMatricula}
              onFocus={() => animarInput(matriculaScale, 'focus')}
              onBlur={() => animarInput(matriculaScale, 'blur')}
            />
          </Animated.View>
          {errors.matricula && <Text style={styles.error}>{errors.matricula}</Text>}

          {errors.geral && <Text style={styles.error}>{errors.geral}</Text>}

          <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
            <Text style={styles.botaoTexto}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSecundario} onPress={limparCampos}>
            <Text style={styles.botaoTextoSec}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },

  scrollCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },

  titulo: {
    color: '#fff',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },

  inputWrapper: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  input: {
    height: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
    fontFamily: 'Poppins',
  },

  error: {
    color: '#DC2626',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },

  botao: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },

  botaoSecundario: {
    backgroundColor: '#64748B',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },

  botaoTextoSec: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
});
