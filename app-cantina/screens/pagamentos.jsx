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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePayment } from '../context/PaymentContext';

const PaymentMethodsScreen = ({ navigation, route }) => {
  const { usuario, darkMode = false } = route.params || {};
  const {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultMethod,
    refreshMethods,
  } = usePayment();

  const [modalVisible, setModalVisible] = useState(false);
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    brand: 'visa',
  });

  const [newPixKey, setNewPixKey] = useState('');

  // Atualizar sempre que a tela for focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshMethods();
    });

    return unsubscribe;
  }, [navigation]);

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

  const handleAddPix = async () => {
    if (!newPixKey.trim()) {
      Alert.alert("Erro", "Digite uma chave PIX válida");
      return;
    }

    setIsSubmitting(true);
    try {
      await addPaymentMethod({
        type: 'pix',
        brand: 'pix',
        name: 'Chave PIX',
        key: newPixKey,
        holderName: usuario?.nome || 'Usuário',
      });
      
      setPixModalVisible(false);
      setNewPixKey('');
      Alert.alert("Sucesso", "Chave PIX adicionada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível adicionar a chave PIX");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCard = async () => {
    // Validações básicas
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (newCard.number.replace(/\s/g, '').length < 16) {
      Alert.alert("Erro", "Número do cartão inválido");
      return;
    }

    setIsSubmitting(true);
    try {
      // Extrair os últimos 4 dígitos
      const last4 = newCard.number.replace(/\s/g, '').slice(-4);
      
      // Detectar a bandeira do cartão
      const brand = detectCardBrand(newCard.number);
      
      await addPaymentMethod({
        type: 'credit',
        brand: brand,
        last4: last4,
        name: newCard.name,
        expiry: newCard.expiry,
        holderName: newCard.name,
      });
      
      setModalVisible(false);
      setNewCard({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        brand: 'visa',
      });
      Alert.alert("Sucesso", "Cartão adicionado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível adicionar o cartão");
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectCardBrand = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    return 'credit'; // fallback
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultMethod(id);
      // Não precisa de Alert, a mudança é visual imediata
    } catch (error) {
      Alert.alert("Erro", "Não foi possível definir como padrão");
    }
  };

  const handleDeleteMethod = (id) => {
    Alert.alert(
      "Remover Método",
      "Tem certeza que deseja remover este método de pagamento?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePaymentMethod(id);
              Alert.alert("Sucesso", "Método removido com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover o método");
            }
          },
        },
      ]
    );
  };

  const formatCardNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/(\d{1,4})/g);
    return groups ? groups.join(' ') : '';
  };

  const getBrandIcon = (brand) => {
    switch (brand) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
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
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#108168';
      case 'discover':
        return '#FF6000';
      case 'pix':
        return '#32BCAD';
      default:
        return '#007AFF';
    }
  };

  const PaymentCard = ({ method }) => (
    <View style={[
      styles.paymentCard,
      darkMode && styles.darkPaymentCard,
      method.isDefault && styles.defaultCard
    ]}>
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
                {method.holderName && `\n${method.holderName}`}
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
            onPress={() => handleSetDefault(method.id)}
          >
            <Ionicons name="star-outline" size={18} color="#007AFF" />
            <Text style={styles.actionText}>Tornar Padrão</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteMethod(method.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={[styles.actionText, { color: '#FF3B30' }]}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          onPress={() => refreshMethods()}
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
                Nenhum método de pagamento cadastrado
              </Text>
              <Text style={[styles.emptyStateSubtext, darkMode && styles.darkSubtext]}>
                Adicione um cartão ou chave PIX para começar
              </Text>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <PaymentCard key={method.id} method={method} />
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
              Seus dados de pagamento são protegidos com criptografia de ponta a ponta
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal para adicionar cartão */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !isSubmitting && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>
                Adicionar Cartão
              </Text>
              <TouchableOpacity 
                onPress={() => !isSubmitting && setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Número do cartão"
                placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                keyboardType="numeric"
                value={formatCardNumber(newCard.number)}
                onChangeText={(text) => setNewCard({...newCard, number: text})}
                maxLength={19} // 16 dígitos + 3 espaços
                editable={!isSubmitting}
              />
              
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Nome no cartão"
                placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                value={newCard.name}
                onChangeText={(text) => setNewCard({...newCard, name: text})}
                editable={!isSubmitting}
              />
              
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput, darkMode && styles.darkInput]}
                  placeholder="MM/AA"
                  placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                  value={newCard.expiry}
                  onChangeText={(text) => setNewCard({...newCard, expiry: text})}
                  maxLength={5}
                  editable={!isSubmitting}
                />
                
                <TextInput
                  style={[styles.input, styles.halfInput, darkMode && styles.darkInput]}
                  placeholder="CVV"
                  placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                  keyboardType="numeric"
                  secureTextEntry
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({...newCard, cvv: text})}
                  maxLength={4}
                  editable={!isSubmitting}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                onPress={handleSaveCard}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Salvar Cartão</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar PIX */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pixModalVisible}
        onRequestClose={() => !isSubmitting && setPixModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>
                Adicionar Chave PIX
              </Text>
              <TouchableOpacity 
                onPress={() => !isSubmitting && setPixModalVisible(false)}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pixInfo}>
              <Ionicons name="qr-code-outline" size={40} color="#32BCAD" />
              <Text style={[styles.pixInfoText, darkMode && styles.darkSubtext]}>
                Digite sua chave PIX (CPF, email, telefone ou chave aleatória)
              </Text>
            </View>
            
            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              placeholder="Ex: 123.456.789-00 ou email@exemplo.com"
              placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
              value={newPixKey}
              onChangeText={setNewPixKey}
              editable={!isSubmitting}
              multiline
            />
            
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.disabledButton]}
              onPress={handleAddPix}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="qr-code" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar Chave PIX</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  darkModalContent: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#000000',
  },
  darkInput: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pixInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pixInfoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PaymentMethodsScreen;