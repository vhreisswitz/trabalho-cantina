import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase, adminFunctions, verificarAdmin } from '../services/database';

export default function AdminDashboard({ route }) {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    totalUsuarios: 0,
    totalProdutos: 0,
    totalTransacoes: 0,
    totalVendas: 0
  });

  useEffect(() => {
    if (route.params?.usuario) {
      const usuarioData = route.params.usuario;
      setUsuario(usuarioData);
      console.log('👤 Usuário recebido:', usuarioData);
      verificarPermissoes(usuarioData);
    } else {
      Alert.alert('Erro', 'Acesso não autorizado');
      navigation.navigate('Login');
    }
  }, [route.params]);

  const verificarPermissoes = async (usuarioData) => {
    try {
      console.log('🔍 Dados do usuário:', usuarioData);
      
      if (!usuarioData || !usuarioData.id) {
        Alert.alert('Erro', 'Dados do usuário incompletos');
        navigation.navigate('Login');
        return;
      }

      const admin = await verificarAdmin(usuarioData.id);
      console.log('✅ É admin?', admin);
      
      setIsAdmin(admin);
      
      if (admin) {
        console.log('🚀 Carregando estatísticas...');
        carregarEstatisticas();
      } else {
        console.log('❌ Não é admin, redirecionando...');
        Alert.alert('Acesso Negado', 'Você não tem permissão de administrador');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar permissões:', error);
      Alert.alert('Erro', 'Falha ao verificar permissões');
      navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const stats = await adminFunctions.getEstatisticasGerais();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const sairAdmin = () => {
    Alert.alert(
      'Sair do Modo Admin',
      'Deseja voltar para o login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005CA9" />
        <Text style={styles.loadingText}>Verificando permissões...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.headerSubtitle}>Bem-vindo, {usuario?.nome}</Text>
        
        <TouchableOpacity style={styles.sairButton} onPress={sairAdmin}>
          <Text style={styles.sairButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Estatísticas Gerais</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{estatisticas.totalUsuarios}</Text>
              <Text style={styles.statLabel}>Usuários</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{estatisticas.totalProdutos}</Text>
              <Text style={styles.statLabel}>Produtos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{estatisticas.totalTransacoes}</Text>
              <Text style={styles.statLabel}>Transações</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>R$ {estatisticas.totalVendas.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Vendas</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>⚡ Ações Rápidas</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageProducts', { usuario })}
          >
            <Text style={styles.actionIcon}>🛍️</Text>
            <Text style={styles.actionText}>Gerenciar Produtos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageUsers', { usuario })}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Gerenciar Usuários</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SalesReports', { usuario })}
          >
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionText}>Relatórios de Vendas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={carregarEstatisticas}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Atualizar Estatísticas</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sairButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sairButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#E6F0FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005CA9',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});