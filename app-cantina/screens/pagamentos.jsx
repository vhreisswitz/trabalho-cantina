import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Pagamentos = ({ navigation, route }) => {
  const { usuario, darkMode = false } = route.params || {};
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    brand: 'visa',
    cardName: 'Cartão',
  });

  const [newPixKey, setNewPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('email');

  // Carregar métodos do AsyncStorage
  useEffect(() => {
    loadPaymentMethods();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadPaymentMethods();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const storedMethods = await AsyncStorage.getItem('@payment_methods');
      if (storedMethods) {
        setPaymentMethods(JSON.parse(storedMethods));
      } else {
        // Métodos padrão
        const defaultMethods = [
          {
            id: '1',
            type: 'credit',
            brand: 'visa',
            last4: '4242',
            name: 'Cartão Principal',
            expiry: '12/25',
            isDefault: true,
            holderName: usuario?.nome || 'Usuário',
          },
          {
            id: '2',
            type: 'debit',
            brand: 'mastercard',
            last4: '8888',
            name: 'Cartão Secundário',
            expiry: '08/24',
            isDefault: false,
            holderName: usuario?.nome || 'Usuário',
          },
        ];
        setPaymentMethods(defaultMethods);
        await savePaymentMethods(defaultMethods);
      }
    } catch (error) {
      console.error('Erro ao carregar métodos:', error);
      Alert.alert("Erro", "Não foi possível carregar os métodos de pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  const savePaymentMethods = async (methods) => {
    try {
      await AsyncStorage.setItem('@payment_methods', JSON.stringify(methods));
    } catch (error) {
      console.error('Erro ao salvar métodos:', error);
    }
  };

  const addPaymentMethod = async (method) => {
    try {
      const newMethod = {
        ...method,
        id: Date.now().toString(),
        isDefault: paymentMethods.length === 0,
      };
      
      const updatedMethods = [...paymentMethods, newMethod];
      setPaymentMethods(updatedMethods);
      await savePaymentMethods(updatedMethods);
      
      // Notificar a tela Settings para atualizar
      if (route.params?.onGoBack) {
        route.params.onGoBack();
      }
      
      return newMethod;
    } catch (error) {
      console.error('Erro ao adicionar método:', error);
      throw error;
    }
  };

  const deletePaymentMethod = async (id) => {
    try {
      const methodToDelete = paymentMethods.find(m => m.id === id);
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      
      if (methodToDelete?.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }
      
      setPaymentMethods(updatedMethods);
      await savePaymentMethods(updatedMethods);
      
      // Notificar a tela Settings para atualizar
      if (route.params?.onGoBack) {
        route.params.onGoBack();
      }
    } catch (error) {
      console.error('Erro ao excluir método:', error);
      throw error;
    }
  };

  const setDefaultMethod = async (id) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }));
      setPaymentMethods(updatedMethods);
      await savePaymentMethods(updatedMethods);
    } catch (error) {
      console.error('Erro ao definir método padrão:', error);
      throw error;
    }
  };

  const handleAddMethod = () => {
    Alert.alert(
      "Adicionar Método",
      "Selecione o tipo de pagamento:",
      [
        {
          text: "Cartão de Crédito/Débito",
          onPress: () => setModalVisible(true),
        },
        {
          text: "PIX",
          onPress: () => setPixModalVisible(true),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  // Restante do código permanece igual...
  // (Copie as funções handleAddPix, handleSaveCard, etc da sua versão original)

  // ... [mantenha todas as outras funções da sua versão original]

  // IMPORTANTE: Remova qualquer referência a usePayment() e use apenas as funções locais

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, darkMode && styles.darkText]}>
            Carregando métodos de pagamento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      darkMode && styles.darkContainer
    ]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[
        styles.header,
        darkMode && styles.darkHeader
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={darkMode ? "#FFFFFF" : "#000000"} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          darkMode && styles.darkText
        ]}>
          Métodos de Pagamento
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            loadPaymentMethods();
            Alert.alert("Atualizado", "Lista de métodos atualizada");
          }}
        >
          <Ionicons 
            name="refresh-outline" 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[
            styles.sectionTitle,
            darkMode && styles.darkSubtext
          ]}>
            MÉTODOS SALVOS ({paymentMethods.length})
          </Text>
          
          {paymentMethods.length === 0 ? (
            <View style={[styles.emptyState, darkMode && styles.darkEmptyState]}>
              <Ionicons name="card-outline" size={60} color="#C7C7CC" />
              <Text style={[styles.emptyStateText, darkMode && styles.darkText]}>
                Nenhum método de pagamento
              </Text>
              <Text style={[styles.emptyStateSubtext, darkMode && styles.darkSubtext]}>
                Adicione um cartão ou chave PIX para começar
              </Text>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <View key={method.id} style={[
                styles.paymentCard,
                darkMode && styles.darkPaymentCard,
                method.isDefault && styles.defaultCard
              ]}>
                {/* Card content */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.brandIcon, { backgroundColor: getBrandColor(method.brand) }]}>
                      <Ionicons 
                        name={getBrandIcon(method.brand)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardName, darkMode && styles.darkText]}>
                        {method.name}
                      </Text>
                      {method.type === 'pix' ? (
                        <Text style={[styles.cardNumber, darkMode && styles.darkSubtext]}>
                          {method.key}
                        </Text>
                      ) : (
                        <Text style={[styles.cardNumber, darkMode && styles.darkSubtext]}>
                          **** **** **** {method.last4} • Expira {method.expiry}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.defaultText}>PADRÃO</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setDefaultMethod(method.id)}
                    >
                      <Ionicons name="star-outline" size={18} color="#007AFF" />
                      <Text style={styles.actionText}>Tornar Padrão</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(
                        "Remover Método",
                        "Tem certeza que deseja remover este método de pagamento?",
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Remover",
                            style: "destructive",
                            onPress: () => deletePaymentMethod(method.id)
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.actionText, { color: '#FF3B30' }]}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={[
              styles.addButton,
              darkMode && styles.darkAddButton
            ]}
            onPress={handleAddMethod}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={24} 
              color="#007AFF" 
            />
            <Text style={styles.addButtonText}>
              Adicionar novo método de pagamento
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons 
              name="shield-checkmark" 
              size={20} 
              color="#4CD964" 
            />
            <Text style={[
              styles.infoText,
              darkMode && styles.darkSubtext
            ]}>
              Seus dados são protegidos com criptografia de ponta a ponta
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modais para adicionar cartão/PIX */}
      {/* Mantenha os modais da sua versão original, mas usando as funções locais */}
      
    </SafeAreaView>
  );
};

// Adicione as funções auxiliares que faltam
const getBrandIcon = (brand) => {
  switch (brand) {
    case 'visa':
    case 'mastercard':
    case 'amex':
    case 'discover':
      return 'card';
    case 'pix':
      return 'qr-code';
    default:
      return 'card';
  }
};

const getBrandColor = (brand) => {
  switch (brand) {
    case 'visa': return '#1A1F71';
    case 'mastercard': return '#EB001B';
    case 'amex': return '#108168';
    case 'discover': return '#FF6000';
    case 'pix': return '#32BCAD';
    default: return '#007AFF';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  darkHeader: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },
  backButton: {
    padding: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  darkEmptyState: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  darkPaymentCard: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  defaultCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  darkAddButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  addButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubtext: {
    color: '#98989F',
  },
});

export default Pagamentos;