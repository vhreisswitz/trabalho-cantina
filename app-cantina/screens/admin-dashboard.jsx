import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/database';
import { useTheme } from '../context/themeContext';

export default function AdminDashboard({ navigation, route }) {
  const { usuario } = route.params;
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingTickets: 0,
  });

  const CORES = {
    fundo: darkMode ? '#0F172A' : '#F8F9FA',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    texto: darkMode ? '#FFFFFF' : '#000000',
    texto_secundario: darkMode ? '#94A3B8' : '#6B7280',
    primaria: '#005CA9',
    entrada: '#34C759',
    saida: '#FF3B30',
    borda: darkMode ? '#334155' : '#E5E7EB',
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

      const { data: salesData } = await supabase
        .from('cantina_transacoes')
        .select('valor')
        .eq('tipo', 'saida');

      const { count: pendingTickets } = await supabase
        .from('cantina_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      const totalSales = salesData?.length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.valor || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalProducts: totalProducts || 0,
        totalSales: totalSales || 0,
        totalRevenue: totalRevenue || 0,
        pendingTickets: pendingTickets || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair do Admin",
      "Deseja sair da área administrativa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
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

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: CORES.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { color: CORES.texto }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: CORES.texto_secundario }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const DashboardButton = ({ title, subtitle, icon, iconColor, onPress }) => (
    <TouchableOpacity
      style={[styles.dashboardButton, { backgroundColor: CORES.card }]}
      onPress={onPress}
    >
      <View style={styles.buttonIconContainer}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.buttonTextContainer}>
        <Text style={[styles.dashboardButtonText, { color: CORES.texto }]}>{title}</Text>
        <Text style={[styles.dashboardButtonSubtext, { color: CORES.texto_secundario }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={CORES.texto_secundario} />
    </TouchableOpacity>
  );

  const dynamicStyles = {
    container: {
      backgroundColor: CORES.fundo,
    },
    header: {
      backgroundColor: CORES.card,
      borderBottomColor: CORES.borda,
    },
    headerTitle: {
      color: CORES.texto,
    },
    welcomeText: {
      color: CORES.texto_secundario,
    },
    sectionTitle: {
      color: CORES.texto,
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <View style={[styles.header, dynamicStyles.header]}>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Admin Dashboard</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primaria} />
          <Text style={[styles.loadingText, { color: CORES.texto_secundario }]}>
            Carregando dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Admin Dashboard</Text>
          <Text style={[styles.welcomeText, dynamicStyles.welcomeText]}>
            Olá, {usuario.nome} 👋
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={CORES.primaria} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[CORES.primaria]}
          />
        }
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeCardContent}>
            <Text style={[styles.welcomeCardTitle, { color: CORES.texto }]}>
              Painel Administrativo
            </Text>
            <Text style={[styles.welcomeCardSubtitle, { color: CORES.texto_secundario }]}>
              Gerencie usuários, produtos e transações
            </Text>
          </View>
          <View style={[styles.welcomeCardIcon, { backgroundColor: CORES.primaria + '20' }]}>
            <Ionicons name="shield-checkmark" size={32} color={CORES.primaria} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Estatísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Usuários"
            value={stats.totalUsers}
            icon="people"
            color="#005CA9"
            onPress={() => navigation.navigate('ManageUsers', { usuario })}
          />
          <StatCard
            title="Usuários Ativos"
            value={stats.activeUsers}
            icon="checkmark-circle"
            color="#34C759"
            onPress={() => navigation.navigate('ManageUsers', { usuario })}
          />
          <StatCard
            title="Produtos"
            value={stats.totalProducts}
            icon="fast-food"
            color="#FF6B35"
            onPress={() => navigation.navigate('ManageProducts', { usuario })}
          />
          <StatCard
            title="Vendas Totais"
            value={stats.totalSales}
            icon="cart"
            color="#FFD60A"
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon="cash"
            color="#34C759"
            onPress={() => navigation.navigate('SalesReports', { usuario })}
          />
          <StatCard
            title="Tickets Ativos"
            value={stats.pendingTickets}
            icon="ticket"
            color="#9D4EDD"
          />
        </View>

        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Gerenciamento</Text>
        <View style={styles.buttonsContainer}>
          <DashboardButton
            title="Gerenciar Usuários"
            subtitle="Ativar/Desativar contas"
            icon="people"
            iconColor="#005CA9"
            onPress={() => navigation.navigate('ManageUsers', { usuario })}
          />
          <DashboardButton
            title="Gerenciar Produtos"
            subtitle="Adicionar/Editar produtos"
            icon="fast-food"
            iconColor="#FF6B35"
            onPress={() => navigation.navigate('ManageProducts', { usuario })}
          />
          <DashboardButton
            title="Relatórios de Vendas"
            subtitle="Ver histórico e gráficos"
            icon="bar-chart"
            iconColor="#34C759"
            onPress={() => navigation.navigate('SalesReports', { usuario })}
          />
          <DashboardButton
            title="Tickets e Vales"
            subtitle="Gerenciar tickets"
            icon="ticket"
            iconColor="#9D4EDD"
            onPress={() => Alert.alert('Tickets', 'Funcionalidade em desenvolvimento')}
          />
          <DashboardButton
            title="Transações"
            subtitle="Ver todas as transações"
            icon="receipt"
            iconColor="#FFD60A"
            onPress={() => Alert.alert('Transações', 'Funcionalidade em desenvolvimento')}
          />
          <DashboardButton
            title="Configurações"
            subtitle="Configurar sistema"
            icon="settings"
            iconColor="#6B7280"
            onPress={() => navigation.navigate('Configuracoes', { usuario })}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Ações Rápidas</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: CORES.card }]}
              onPress={() => Alert.alert('Recarga Rápida', 'Funcionalidade em desenvolvimento')}
            >
              <Ionicons name="add-circle" size={20} color="#34C759" />
              <Text style={[styles.quickActionText, { color: CORES.texto }]}>Recarga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: CORES.card }]}
              onPress={() => Alert.alert('Novo Produto', 'Funcionalidade em desenvolvimento')}
            >
              <Ionicons name="add" size={20} color="#FF6B35" />
              <Text style={[styles.quickActionText, { color: CORES.texto }]}>Produto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: CORES.card }]}
              onPress={() => Alert.alert('Notificar', 'Funcionalidade em desenvolvimento')}
            >
              <Ionicons name="notifications" size={20} color="#FFD60A" />
              <Text style={[styles.quickActionText, { color: CORES.texto }]}>Notificar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: CORES.card }]}
              onPress={() => navigation.navigate('ManageUsers', { usuario })}
            >
              <Ionicons name="person-add" size={20} color="#005CA9" />
              <Text style={[styles.quickActionText, { color: CORES.texto }]}>Novo User</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: CORES.texto_secundario }]}>
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </Text>
          <Text style={[styles.versionText, { color: CORES.texto_secundario }]}>
            Versão Admin 2.1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
    marginTop: 4,
  },
  headerRight: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#005CA9',
  },
  welcomeCardContent: {
    flex: 1,
  },
  welcomeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  welcomeCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,92,169,0.1)',
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dashboardButtonSubtext: {
    fontSize: 12,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionButton: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
  },
});