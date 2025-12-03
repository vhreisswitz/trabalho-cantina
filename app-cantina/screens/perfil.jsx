import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadProfileImage, deleteProfileImage, getUsuarioData } from '../services/database';

const Perfil = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado');
        navigation.navigate('Login');
        return;
      }

      const data = await getUsuarioData(userId);
      setUserData(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadUserImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acessar sua câmera!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadUserImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const uploadUserImage = async (imageUri) => {
    setUploadingImage(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('Usuário não identificado');
      }

      const imageUrl = await uploadProfileImage(userId, imageUri);
      
      setUserData(prev => ({
        ...prev,
        profile_image: imageUrl
      }));

      Alert.alert('Sucesso!', 'Foto atualizada com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar a imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const removePhoto = async () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem('userId');
              await deleteProfileImage(userId);
              
              setUserData(prev => ({
                ...prev,
                profile_image: null
              }));

              Alert.alert('Sucesso', 'Foto removida com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao remover foto');
            }
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    if (uploadingImage) return;

    const options = [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar foto', onPress: takePhoto },
      { text: 'Escolher da galeria', onPress: pickImage },
    ];

    if (userData?.profile_image) {
      options.push({
        text: 'Remover foto atual',
        style: 'destructive',
        onPress: removePhoto,
      });
    }

    Alert.alert(
      'Alterar foto de perfil',
      'Escolha uma opção:',
      options
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={showImageOptions}
          disabled={uploadingImage}
          style={styles.avatarContainer}
        >
          {userData?.profile_image ? (
            <Image
              source={{ uri: userData.profile_image }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userData?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          
          <View style={styles.cameraIcon}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{userData?.nome || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{userData?.email || ''}</Text>
        <Text style={styles.userType}>
          {userData?.tipo === 'admin' ? 'Administrador' : 
           userData?.tipo === 'student' ? 'Aluno' : 'Usuário'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Matrícula</Text>
          <Text style={styles.infoValue}>{userData?.matricula || 'Não informada'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Saldo Disponível</Text>
          <Text style={styles.infoValue}>R$ {userData?.saldo?.toFixed(2) || '0,00'}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.infoCard, styles.balanceCard]}
          onPress={() => navigation.navigate('RecarregarSaldo')}
        >
          <Text style={styles.infoLabel}>Recarregar Saldo</Text>
          <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Extrato')}
        >
          <MaterialIcons name="receipt" size={24} color="#666" />
          <Text style={styles.menuText}>Ver Extrato</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('MeusTickets')}
        >
          <MaterialIcons name="confirmation-number" size={24} color="#666" />
          <Text style={styles.menuText}>Meus Tickets</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialIcons name="settings" size={24} color="#666" />
          <Text style={styles.menuText}>Configurações</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Sobre')}
        >
          <MaterialIcons name="info" size={24} color="#666" />
          <Text style={styles.menuText}>Sobre o App</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {userData?.tipo === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administração</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <MaterialIcons name="dashboard" size={24} color="#666" />
            <Text style={styles.menuText}>Dashboard</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ManageProducts')}
          >
            <MaterialIcons name="fastfood" size={24} color="#666" />
            <Text style={styles.menuText}>Gerenciar Produtos</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ManageUsers')}
          >
            <MaterialIcons name="people" size={24} color="#666" />
            <Text style={styles.menuText}>Gerenciar Usuários</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={24} color="#fff" />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          App Cantina v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 30,
    alignItems: 'center',
    paddingTop: 50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: '#bdbdbd',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  section: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  balanceCard: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default Perfil;