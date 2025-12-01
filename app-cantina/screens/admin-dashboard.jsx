import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/database';

export default function AdminDashboard({ route }) {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (route.params?.usuario) {
      const usuarioData = route.params.usuario;
      setUsuario(usuarioData);
      loadStats();
    } else {
      Alert.alert('Erro', 'Acesso não autorizado');
      navigation.navigate('Login');
    }
  }, [route.params]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const { count: totalUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      const { count: totalProducts } = await supabase
        .from('cantina_produtos')
        .select('*', { count: 'exact', head: true });

      const { count: activeProducts } = await supabase
        .from('cantina_produtos')
        .select('*', { count: 'exact', head: true })
        .eq('disponivel', true);

      const { data: salesData } = await supabase
        .from('cantina_transacoes')
        .select('valor')
        .eq('tipo', 'saida');

      const totalSales = salesData?.length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.valor || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalSales: totalSales || 0,
        totalRevenue: totalRevenue || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair do Admin',
      'Deseja sair da área administrativa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#005CA9" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.welcomeText}>Olá, {usuario?.nome}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Usuários</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Usuários Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Produtos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.activeProducts}</Text>
            <Text style={styles.statLabel}>Produtos Ativos</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Gerenciamento</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ManageUsers', { usuario })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#005CA9' }]}>
              <Ionicons name="people" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Gerenciar Usuários</Text>
              <Text style={styles.actionSubtitle}>Adicionar, ativar/desativar usuários</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ManageProducts', { usuario })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B35' }]}>
              <Ionicons name="fast-food" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Gerenciar Produtos</Text>
              <Text style={styles.actionSubtitle}>Adicionar, editar produtos</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('SalesReports', { usuario })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#34C759' }]}>
              <Ionicons name="bar-chart" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Relatórios de Vendas</Text>
              <Text style={styles.actionSubtitle}>Histórico e gráficos</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em breve')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#9D4EDD' }]}>
              <Ionicons name="ticket" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Gerenciar Tickets</Text>
              <Text style={styles.actionSubtitle}>Ver e validar tickets</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickAction} onPress={loadStats}>
              <Ionicons name="refresh" size={24} color="#005CA9" />
              <Text style={styles.quickActionText}>Atualizar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('ManageUsers', { usuario })}>
              <Ionicons name="person-add" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Add Usuário</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('ManageProducts', { usuario })}>
              <Ionicons name="add-circle" size={24} color="#FF6B35" />
              <Text style={styles.quickActionText}>Add Produto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em breve')}>
              <Ionicons name="notifications" size={24} color="#FFD60A" />
              <Text style={styles.quickActionText}>Notificar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#005CA9',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005CA9',
    marginBottom: 12,
    marginLeft: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});