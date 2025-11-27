import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  StatusBar,
  Animated,
  Image,
  Alert,
  Linking
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/themeContext'; // Verifique o caminho correto

export default function Settings({ navigation, route }) {
  const usuario = route.params?.usuario || { 
    nome: 'wesley', 
    email: 'wesleybairroscorrea40@gmail.com',
    telefone: '(48) 99999-9999'
  };
  
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [language, setLanguage] = useState('Português');
  
  const [scaleAnim] = useState(new Animated.Value(1));

  // USE O CONTEXTO DE FORMA SIMPLES - CORRIGIDO
  const { darkMode, setTheme } = useTheme();

  // Função para alternar o modo escuro - CORRIGIDA (SIMPLES)
  const toggleDarkMode = (value) => {
    console.log('Mudando tema para:', value ? 'dark' : 'light');
    setTheme(value);
  };

  // Função para lidar com logout
  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
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

  // Função para informações pessoais
  const handlePersonalInfo = () => {
    Alert.alert(
      "Informações Pessoais",
      `Nome: ${usuario.nome}\nEmail: ${usuario.email}\nTelefone: ${usuario.telefone}`,
      [{ text: "OK" }]
    );
  };

  // Função para segurança
  const handleSecurity = () => {
    Alert.alert(
      "Segurança",
      "Configurações de segurança:\n\n• Alterar senha\n• Autenticação de dois fatores\n• Histórico de login",
      [
        { text: "Alterar Senha", onPress: () => Alert.alert("Alterar Senha", "Redirecionando...") },
        { text: "2FA", onPress: () => Alert.alert("2FA", "Configurar autenticação de dois fatores") },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  // Função para métodos de pagamento
  const handlePaymentMethods = () => {
    Alert.alert(
      "Métodos de Pagamento",
      "Seus métodos cadastrados:\n\n• Cartão de Crédito **** 1234\n• PIX\n• Saldo da Carteira",
      [
        { text: "Adicionar Cartão", onPress: () => Alert.alert("Adicionar Cartão", "Funcionalidade em desenvolvimento") },
        { text: "Gerenciar PIX", onPress: () => Alert.alert("PIX", "Configurações PIX") },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  // Função para extrato - agora navega para tela de histórico
  const handleStatement = () => {
    navigation.navigate('Extrato', { usuario });
  };

  // Função para selecionar idioma
  const handleLanguage = () => {
    Alert.alert(
      "Selecionar Idioma",
      "Escolha o idioma do aplicativo:",
      [
        { text: "Português", onPress: () => setLanguage('Português') },
        { text: "English", onPress: () => setLanguage('English') },
        { text: "Español", onPress: () => setLanguage('Español') },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  // Função para ajuda e suporte
  const handleHelpSupport = () => {
    Alert.alert(
      "Ajuda & Suporte",
      "Como podemos ajudar?",
      [
        { 
          text: "WhatsApp", 
          onPress: () => Linking.openURL('https://wa.me/5548999999999') 
        },
        { 
          text: "Ligar", 
          onPress: () => Linking.openURL('tel:+5548999999999') 
        },
        { 
          text: "Email", 
          onPress: () => Linking.openURL('mailto:suporte@senai.com') 
        },
        { text: "Perguntas Frequentes", onPress: () => Alert.alert("FAQ", "Abrindo perguntas frequentes...") },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  // Função para privacidade e segurança
  const handlePrivacySecurity = () => {
    Alert.alert(
      "Privacidade e Segurança",
      "Configurações de privacidade:",
      [
        { text: "Política de Privacidade", onPress: () => Alert.alert("Política", "Abrindo política de privacidade...") },
        { text: "Termos de Uso", onPress: () => Alert.alert("Termos", "Abrindo termos de uso...") },
        { text: "Permissões do App", onPress: () => Alert.alert("Permissões", "Gerenciar permissões...") },
        { text: "Excluir Conta", onPress: () => 
          Alert.alert(
            "Excluir Conta", 
            "Esta ação não pode ser desfeita. Tem certeza?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", style: "destructive", onPress: () => Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso") }
            ]
          ) 
        },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const SettingItem = ({ icon, title, subtitle, onPress, hasSwitch, value, onValueChange, isLast }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.settingItem, 
          darkMode && styles.darkSettingItem,
          isLast && styles.lastItem
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, darkMode && styles.darkIconContainer]}>
            <Ionicons name={icon} size={22} color="#007AFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.settingTitle, darkMode && styles.darkText]}>{title}</Text>
            {subtitle && <Text style={[styles.settingSubtitle, darkMode && styles.darkSubtext]}>{subtitle}</Text>}
          </View>
        </View>
        
        {hasSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={darkMode ? "#8E8E93" : "#C7C7CC"} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    container: {
      backgroundColor: darkMode ? '#000000' : '#F8F9FA',
    },
    header: {
      backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF',
      borderBottomColor: darkMode ? '#38383A' : '#E5E5EA',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={[styles.backButton, darkMode && styles.darkBackButton]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Configurações</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.profileSection, darkMode && styles.darkSection]}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={[styles.userName, darkMode && styles.darkText]}>{usuario.nome}</Text>
          <Text style={[styles.userEmail, darkMode && styles.darkSubtext]}>{usuario.email}</Text>
        </View>

        {/* Settings Sections */}
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>CONTA</Text>
          <SettingItem
            icon="person-outline"
            title="Informações Pessoais"
            onPress={handlePersonalInfo}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Segurança"
            subtitle="Senha, 2FA"
            onPress={handleSecurity}
          />
          <SettingItem
            icon="card-outline"
            title="Métodos de Pagamento"
            onPress={handlePaymentMethods}
          />
          <SettingItem
            icon="document-text-outline"
            title="Extrato"
            subtitle="Histórico de transações"
            isLast={true}
            onPress={handleStatement}
          />
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>PREFERÊNCIAS</Text>
          <SettingItem
            icon="notifications-outline"
            title="Notificações"
            hasSwitch={true}
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem
            icon="moon-outline"
            title="Modo Escuro"
            hasSwitch={true}
            value={darkMode}
            onValueChange={toggleDarkMode}
          />
          <SettingItem
            icon="language-outline"
            title="Idioma"
            subtitle={language}
            onPress={handleLanguage}
          />
          <SettingItem
            icon="finger-print-outline"
            title="Biometria"
            subtitle="Face ID / Touch ID"
            hasSwitch={true}
            value={biometric}
            onValueChange={setBiometric}
            isLast={true}
          />
        </View>

        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSectionTitle]}>SUPORTE</Text>
          <SettingItem
            icon="help-circle-outline"
            title="Ajuda & Suporte"
            onPress={handleHelpSupport}
          />
          <SettingItem
            icon="information-circle-outline"
            title="Sobre o App"
            onPress={() => navigation.navigate('Sobre')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacidade e Segurança"
            isLast={true}
            onPress={handlePrivacySecurity}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, darkMode && styles.darkLogoutButton]}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.versionText, darkMode && styles.darkSubtext]}>Versão 2.1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Os estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  darkBackButton: {
    backgroundColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  darkSection: {
    backgroundColor: '#1C1C1E',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 15,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 20,
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  darkSectionTitle: {
    color: '#98989F',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  darkSettingItem: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F2F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  darkIconContainer: {
    backgroundColor: '#2C2C2E',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubtext: {
    color: '#98989F',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  darkLogoutButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});