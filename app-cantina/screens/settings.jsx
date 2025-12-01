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
import * as ImagePicker from "expo-image-picker";

export default function Settings({ navigation, route }) {
  const usuario = route.params?.usuario || { 
    nome: 'wesley', 
    email: 'wesleybairroscorrea40@gmail.com',
    telefone: '(48) 99999-9999'
  };

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [language, setLanguage] = useState('Português');
  
  const [profilePhoto, setProfilePhoto] = useState(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
  );

  const [scaleAnim] = useState(new Animated.Value(1));

  // 📸 TROCAR FOTO DE PERFIL DE VERDADE
  const handleChangePhoto = () => {
    Alert.alert(
      "Mudar Foto de Perfil",
      "Escolha uma opção:",
      [
        { text: "Tirar Foto", onPress: openCamera },
        { text: "Escolher da Galeria", onPress: openGallery },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permissão negada", "Ative a câmera.");

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permissão negada", "Ative a galeria.");

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const toggleDarkMode = (value) => setDarkMode(value);

  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
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

  const handlePersonalInfo = () => {
    Alert.alert(
      "Informações Pessoais",
      `Nome: ${usuario.nome}\nEmail: ${usuario.email}\nTelefone: ${usuario.telefone}`,
      [{ text: "OK" }]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      "Segurança",
      "Configurações:\n• Alterar senha\n• 2FA\n• Histórico de login"
    );
  };

  const handlePaymentMethods = () => {
    Alert.alert(
      "Métodos de Pagamento",
      "• Cartão **** 1234\n• PIX\n• Saldo da Carteira"
    );
  };

  const handleStatement = () => {
    navigation.navigate('Extrato', { usuario });
  };

  const handleLanguage = () => {
    Alert.alert(
      "Idioma",
      "Escolha:",
      [
        { text: "Português", onPress: () => setLanguage('Português') },
        { text: "English", onPress: () => setLanguage('English') },
        { text: "Español", onPress: () => setLanguage('Español') },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      "Suporte",
      "Escolha:",
      [
        { text: "WhatsApp", onPress: () => Linking.openURL('https://wa.me/5548999999999') },
        { text: "Ligar", onPress: () => Linking.openURL('tel:+5548999999999') },
        { text: "Email", onPress: () => Linking.openURL('mailto:suporte@senai.com') },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handlePrivacySecurity = () => {
    Alert.alert(
      "Privacidade",
      "• Política\n• Termos\n• Permissões"
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
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={darkMode ? "#8E8E93" : "#C7C7CC"} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const dynamicStyles = {
    container: { backgroundColor: darkMode ? '#000' : '#F8F9FA' },
    header: { backgroundColor: darkMode ? '#1C1C1E' : '#FFF' },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={[styles.backButton, darkMode && styles.darkBackButton]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Configurações</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* PERFIL */}
        <View style={[styles.profileSection, darkMode && styles.darkSection]}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={[styles.userName, darkMode && styles.darkText]}>{usuario.nome}</Text>
          <Text style={[styles.userEmail, darkMode && styles.darkSubtext]}>{usuario.email}</Text>

          <TouchableOpacity onPress={handleChangePhoto} style={{ marginTop: 10 }}>
            <Text style={{ color: "#007AFF", fontSize: 15, fontWeight: "600" }}>
              Mudar foto de perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTA */}
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSubtext]}>CONTA</Text>
          <SettingItem icon="person-outline" title="Informações Pessoais" onPress={handlePersonalInfo} />
          <SettingItem icon="lock-closed-outline" title="Segurança" subtitle="Senha, 2FA" onPress={handleSecurity} />
          <SettingItem icon="card-outline" title="Métodos de Pagamento" onPress={handlePaymentMethods} />
          <SettingItem icon="document-text-outline" title="Extrato" subtitle="Transações" onPress={handleStatement} isLast />
        </View>

        {/* PREFERÊNCIAS */}
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSubtext]}>PREFERÊNCIAS</Text>
          <SettingItem icon="notifications-outline" title="Notificações" hasSwitch value={notifications} onValueChange={setNotifications} />
          <SettingItem icon="moon-outline" title="Modo Escuro" hasSwitch value={darkMode} onValueChange={toggleDarkMode} />
          <SettingItem icon="language-outline" title="Idioma" subtitle={language} onPress={handleLanguage} />
          <SettingItem icon="finger-print-outline" title="Biometria" subtitle="Face ID / Touch ID" hasSwitch value={biometric} onValueChange={setBiometric} isLast />
        </View>

        {/* SUPORTE */}
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkSubtext]}>SUPORTE</Text>
          <SettingItem icon="help-circle-outline" title="Ajuda & Suporte" onPress={handleHelpSupport} />
          <SettingItem icon="information-circle-outline" title="Sobre o App" onPress={() => navigation.navigate("Sobre")} />
          <SettingItem icon="shield-checkmark-outline" title="Privacidade e Segurança" onPress={handlePrivacySecurity} isLast />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={[styles.logoutButton, darkMode && styles.darkLogoutButton]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
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
    color: '#000',
  },
  headerRight: { width: 40 },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  darkSection: { backgroundColor: '#1C1C1E' },
  avatarContainer: { position: 'relative', marginBottom: 15 },
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
    borderColor: '#FFF',
  },
  userName: { fontSize: 22, fontWeight: '700', color: '#000' },
  userEmail: { fontSize: 16, color: '#8E8E93' },
  section: { backgroundColor: '#FFF', marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', paddingHorizontal: 20, paddingVertical: 8 },
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
  lastItem: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F2F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  darkIconContainer: { backgroundColor: '#2C2C2E' },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#000' },
  settingSubtitle: { fontSize: 14, color: '#8E8E93' },
  darkText: { color: '#FFF' },
  darkSubtext: { color: '#98989F' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
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
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  footer: { alignItems: 'center', paddingVertical: 30 },
  versionText: { fontSize: 14, color: '#C7C7CC' },
});
