import React, { useState, useEffect } from "react";
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
  Linking,
  Modal,
  TextInput,
  SafeAreaView
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
  const [darkModeModal, setDarkModeModal] = useState(false);
  const [paymentMethodsCount, setPaymentMethodsCount] = useState(0);
  
  const [scaleAnim] = useState(new Animated.Value(1));

  // USE O CONTEXTO DE FORMA SIMPLES - CORRIGIDO
  const { darkMode, setTheme } = useTheme();

  // Função para alternar o modo escuro - CORRIGIDA (SIMPLES)
  const toggleDarkMode = (value) => {
    if (value !== darkMode) {
      setDarkModeModal(true);
      setTimeout(() => {
        console.log('Mudando tema para:', value ? 'dark' : 'light');
        setTheme(value);
        setDarkModeModal(false);
      }, 1500);
    }
  };

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
          style: "destructive",
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

  const handlePersonalInfo = () => {
    Alert.alert(
      "Informações Pessoais",
      `Nome: ${usuario.nome}\nEmail: ${usuario.email}\nTelefone: ${usuario.telefone}`,
      [
        { 
          text: "Editar", 
          onPress: () => Alert.alert("Editar", "Funcionalidade em desenvolvimento") 
        },
        { text: "OK", style: "default" }
      ]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      "Segurança",
      "Configurações de segurança:\n\n• Alterar senha\n• Autenticação de dois fatores\n• Histórico de login",
      [
        { 
          text: "Alterar Senha", 
          onPress: () => navigation.navigate('ChangePassword', { usuario }) 
        },
        { 
          text: "2FA", 
          onPress: () => Alert.alert("2FA", "Configurar autenticação de dois fatores") 
        },
        { 
          text: "Histórico", 
          onPress: () => navigation.navigate('LoginHistory', { usuario }) 
        },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  // Função para métodos de pagamento
  const handlePaymentMethods = () => {
    navigation.navigate('PaymentMethods', { 
      usuario,
      darkMode,
      onGoBack: updatePaymentCount // Callback para atualizar ao voltar
    });
  };

  const handleStatement = () => {
    navigation.navigate('Extrato', { usuario });
  };

  const handleLanguage = () => {
    Alert.alert(
      "Selecionar Idioma",
      "Escolha o idioma do aplicativo:",
      [
        { 
          text: "Português", 
          onPress: () => {
            setLanguage('Português');
            Alert.alert("Sucesso", "Idioma alterado para Português");
          }
        },
        { 
          text: "English", 
          onPress: () => {
            setLanguage('English');
            Alert.alert("Success", "Language changed to English");
          }
        },
        { 
          text: "Español", 
          onPress: () => {
            setLanguage('Español');
            Alert.alert("Éxito", "Idioma cambiado a Español");
          }
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

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
        { 
          text: "Perguntas Frequentes", 
          onPress: () => navigation.navigate('FAQ') 
        },
        { 
          text: "Chat Online", 
          onPress: () => navigation.navigate('ChatSupport') 
        },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  const handlePrivacySecurity = () => {
    Alert.alert(
      "Privacidade e Segurança",
      "Configurações de privacidade:",
      [
        { 
          text: "Política de Privacidade", 
          onPress: () => navigation.navigate('PrivacyPolicy') 
        },
        { 
          text: "Termos de Uso", 
          onPress: () => navigation.navigate('TermsOfUse') 
        },
        { 
          text: "Permissões do App", 
          onPress: () => navigation.navigate('AppPermissions') 
        },
        { 
          text: "Excluir Conta", 
          style: "destructive",
          onPress: () => 
            Alert.alert(
              "Excluir Conta", 
              "Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.",
              [
                { text: "Cancelar", style: "cancel" },
                { 
                  text: "Excluir", 
                  style: "destructive", 
                  onPress: () => {
                    Alert.alert(
                      "Confirmação Final",
                      "Digite 'EXCLUIR' para confirmar:",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Confirmar",
                          onPress: () => {
                            Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso");
                            navigation.reset({
                              index: 0,
                              routes: [{ name: 'Login' }],
                            });
                          }
                        }
                      ]
                    );
                  }
                }
              ]
            ) 
        },
        { text: "Fechar", style: "cancel" }
      ]
    );
  };

  // Função para sobre o app
  const handleAboutApp = () => {
    navigation.navigate('AboutApp', { 
      version: '2.1.0',
      darkMode
    });
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

  const SettingItem = ({ icon, title, subtitle, onPress, hasSwitch, value, onValueChange, isLast, badge }) => (
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
            <View style={styles.titleRow}>
              <Text style={[styles.settingTitle, darkMode && styles.darkText]}>{title}</Text>
              {badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            {subtitle && <Text style={[styles.settingSubtitle, darkMode && styles.darkSubtext]}>{subtitle}</Text>}
          </View>
        </View>
        
        {hasSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: darkMode ? '#38383A' : '#767577', true: '#007AFF' }}
            thumbColor={value ? '#FFFFFF' : darkMode ? '#48484A' : '#f4f3f4'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={darkMode ? "#8E8E93" : "#C7C7CC"} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

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
              subtitle="Alertas e notificações push"
              hasSwitch={true}
              value={notifications}
              onValueChange={setNotifications}
            />
            <SettingItem
              icon="moon-outline"
              title="Modo Escuro"
              subtitle="Tema escuro/claro"
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
              subtitle="FAQ, chat, contato"
              onPress={handleHelpSupport}
            />
            <SettingItem
              icon="information-circle-outline"
              title="Sobre o App"
              subtitle="Versão, termos, política"
              onPress={handleAboutApp}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacidade e Segurança"
              subtitle="Políticas e permissões"
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
            <Text style={[styles.versionText, darkMode && styles.darkSubtext]}>Versão 2.1.0 • Build 210</Text>
            <TouchableOpacity onPress={() => Alert.alert("Atualizações", "Verificando atualizações...")}>
              <Text style={[styles.updateText, darkMode && styles.darkSubtext]}>Verificar atualizações</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de Troca de Tema */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={darkModeModal}
          onRequestClose={() => setDarkModeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
              <Ionicons 
                name={darkMode ? "sunny-outline" : "moon-outline"} 
                size={60} 
                color="#007AFF" 
              />
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>
                {darkMode ? 'Alternando para Modo Claro' : 'Alternando para Modo Escuro'}
              </Text>
              <Text style={[styles.modalSubtitle, darkMode && styles.darkSubtext]}>
                {darkMode 
                  ? 'Ajustando cores para melhor visualização diurna' 
                  : 'Ajustando cores para melhor conforto noturno'}
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  darkSafeArea: {
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
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
  headerButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 15,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  darkEditButton: {
    backgroundColor: '#2C2C2E',
    borderColor: '#38383A',
  },
  editProfileText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    paddingVertical: 10,
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
    width: 40,
    height: 40,
    borderRadius: 10,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
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
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
    borderWidth: 1.5,
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
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#C7C7CC',
    marginBottom: 8,
  },
  updateText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  darkModalContent: {
    backgroundColor: '#1C1C1E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});