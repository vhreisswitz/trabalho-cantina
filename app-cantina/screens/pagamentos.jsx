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
    cardName: 'Novo Cartão',
  });

  const [newPixKey, setNewPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('email');

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
      
      if (route.params?.onGoBack) {
        route.params.onGoBack();
      }
      
      Alert.alert("Sucesso", "Método removido com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir método:', error);
      Alert.alert("Erro", "Não foi possível remover o método");
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
      Alert.alert("Sucesso", "Método definido como padrão!");
    } catch (error) {
      console.error('Erro ao definir método padrão:', error);
      Alert.alert("Erro", "Não foi possível definir como padrão");
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const handleAddPix = async () => {
    let keyToSave = newPixKey.trim();
    
    if (!keyToSave) {
      Alert.alert("Erro", "Digite uma chave PIX válida");
      return;
    }

    let isValid = true;
    let errorMessage = "";
    
    switch(pixKeyType) {
      case 'email':
        isValid = validateEmail(keyToSave);
        errorMessage = "Digite um email válido";
        break;
      case 'cpf':
        isValid = validateCPF(keyToSave);
        errorMessage = "Digite um CPF válido (11 dígitos)";
        break;
      case 'phone':
        isValid = validatePhone(keyToSave);
        errorMessage = "Digite um telefone válido (10-11 dígitos)";
        break;
      case 'random':
        isValid = keyToSave.length >= 10;
        errorMessage = "Chave aleatória deve ter pelo menos 10 caracteres";
        break;
    }

    if (!isValid) {
      Alert.alert("Erro", errorMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      await addPaymentMethod({
        type: 'pix',
        brand: 'pix',
        name: getPixDisplayName(pixKeyType, keyToSave),
        key: keyToSave,
        holderName: usuario?.nome || 'Usuário',
        keyType: pixKeyType,
      });
      
      setPixModalVisible(false);
      setNewPixKey('');
      Alert.alert("Sucesso", "Chave PIX adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar PIX:', error);
      Alert.alert("Erro", "Não foi possível adicionar a chave PIX");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPixDisplayName = (type, key) => {
    switch(type) {
      case 'email':
        return 'PIX Email';
      case 'cpf':
        return 'PIX CPF';
      case 'phone':
        return 'PIX Celular';
      case 'random':
        return 'Chave Aleatória';
      default:
        return 'Chave PIX';
    }
  };

  const handleSaveCard = async () => {
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv || !newCard.cardName) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    const cleanNumber = newCard.number.replace(/\s/g, '');
    
    if (cleanNumber.length < 16) {
      Alert.alert("Erro", "Número do cartão inválido (deve ter 16 dígitos)");
      return;
    }

    if (!/^\d+$/.test(cleanNumber)) {
      Alert.alert("Erro", "Número do cartão deve conter apenas dígitos");
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(newCard.expiry)) {
      Alert.alert("Erro", "Data de validade inválida (use MM/AA)");
      return;
    }

    const [month, year] = newCard.expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      Alert.alert("Erro", "Cartão expirado");
      return;
    }

    if (!/^\d{3,4}$/.test(newCard.cvv)) {
      Alert.alert("Erro", "CVV inválido (deve ter 3 ou 4 dígitos)");
      return;
    }

    setIsSubmitting(true);
    try {
      const last4 = cleanNumber.slice(-4);
      const brand = detectCardBrand(cleanNumber);
      
      await addPaymentMethod({
        type: 'credit',
        brand: brand,
        last4: last4,
        name: newCard.cardName,
        expiry: newCard.expiry,
        holderName: newCard.name,
      });
      
      setModalVisible(false);
      setNewCard({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        cardName: 'Novo Cartão',
      });
      Alert.alert("Sucesso", "Cartão adicionado com sucesso!");
    } catch (error) {
      console.error('Erro detalhado:', error);
      Alert.alert("Erro", "Não foi possível adicionar o cartão");
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectCardBrand = (number) => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    return 'credit';
  };

  const handleCardNumberChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    cleaned = cleaned.substring(0, 16);
    
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    setNewCard({...newCard, number: formatted});
  };

  const handleExpiryChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    cleaned = cleaned.substring(0, 4);
    
    if (cleaned.length >= 3) {
      cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    
    setNewCard({...newCard, expiry: cleaned});
  };

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
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, darkMode && styles.darkHeader]}>
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
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>
          Métodos de Pagamento
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={loadPaymentMethods}
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
          <Text style={[styles.sectionTitle, darkMode && styles.darkSubtext]}>
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
            style={[styles.addButton, darkMode && styles.darkAddButton]}
            onPress={handleAddMethod}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addButtonText}>
              Adicionar novo método de pagamento
            </Text>
          </TouchableOpacity>

          <View style={[styles.infoBox, darkMode && styles.darkInfoBox]}>
            <Ionicons name="shield-checkmark" size={20} color="#4CD964" />
            <Text style={[styles.infoText, darkMode && styles.darkSubtext]}>
              Seus dados são protegidos com criptografia de ponta a ponta
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
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
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Nome do cartão (ex: Cartão Principal)"
                placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                value={newCard.cardName}
                onChangeText={(text) => setNewCard({...newCard, cardName: text})}
                editable={!isSubmitting}
              />
              
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Número do cartão (16 dígitos)"
                placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                keyboardType="numeric"
                value={newCard.number}
                onChangeText={handleCardNumberChange}
                maxLength={19}
                editable={!isSubmitting}
              />
              
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Nome completo (como no cartão)"
                placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                value={newCard.name}
                onChangeText={(text) => setNewCard({...newCard, name: text})}
                editable={!isSubmitting}
                autoCapitalize="words"
              />
              
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput, darkMode && styles.darkInput]}
                  placeholder="MM/AA"
                  placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                  value={newCard.expiry}
                  onChangeText={handleExpiryChange}
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
                  onChangeText={(text) => setNewCard({...newCard, cvv: text.replace(/\D/g, '')})}
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
              
              <TouchableOpacity
                style={[styles.cancelButton, darkMode && styles.darkCancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelButtonText, darkMode && styles.darkCancelButtonText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para adicionar PIX */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pixModalVisible}
        onRequestClose={() => !isSubmitting && setPixModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
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
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={styles.pixInfo}>
                <Ionicons name="qr-code-outline" size={40} color="#32BCAD" />
                <Text style={[styles.pixInfoText, darkMode && styles.darkSubtext]}>
                  Escolha o tipo de chave PIX
                </Text>
              </View>
              
              <View style={styles.pixTypeSelector}>
                {['email', 'cpf', 'phone', 'random'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pixTypeButton,
                      pixKeyType === type && styles.pixTypeButtonActive,
                      darkMode && styles.darkPixTypeButton,
                      pixKeyType === type && darkMode && styles.darkPixTypeButtonActive
                    ]}
                    onPress={() => {
                      setPixKeyType(type);
                      setNewPixKey('');
                    }}
                  >
                    <Ionicons 
                      name={
                        type === 'email' ? 'mail-outline' :
                        type === 'cpf' ? 'person-outline' :
                        type === 'phone' ? 'phone-portrait-outline' :
                        'key-outline'
                      } 
                      size={20} 
                      color={pixKeyType === type ? "#FFFFFF" : "#007AFF"} 
                    />
                    <Text style={[
                      styles.pixTypeText,
                      pixKeyType === type && styles.pixTypeTextActive,
                      darkMode && styles.darkPixTypeText
                    ]}>
                      {type === 'email' ? 'Email' :
                       type === 'cpf' ? 'CPF' :
                       type === 'phone' ? 'Telefone' :
                       'Aleatória'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.inputLabel, darkMode && styles.darkText]}>
                {pixKeyType === 'email' ? 'Digite seu email:' :
                 pixKeyType === 'cpf' ? 'Digite seu CPF:' :
                 pixKeyType === 'phone' ? 'Digite seu telefone:' :
                 'Digite a chave aleatória:'}
              </Text>
              
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder={
                  pixKeyType === 'email' ? 'exemplo@email.com' :
                  pixKeyType === 'cpf' ? '123.456.789-00' :
                  pixKeyType === 'phone' ? '(11) 99999-9999' :
                  'Chave aleatória gerada pelo banco'
                }
                placeholderTextColor={darkMode ? "#8E8E93" : "#C7C7CC"}
                value={newPixKey}
                onChangeText={setNewPixKey}
                editable={!isSubmitting}
                multiline={pixKeyType === 'random'}
                keyboardType={
                  pixKeyType === 'email' ? 'email-address' :
                  pixKeyType === 'cpf' ? 'numeric' :
                  pixKeyType === 'phone' ? 'phone-pad' :
                  'default'
                }
                autoCapitalize={pixKeyType === 'email' ? 'none' : 'none'}
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
              
              <TouchableOpacity
                style={[styles.cancelButton, darkMode && styles.darkCancelButton]}
                onPress={() => setPixModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelButtonText, darkMode && styles.darkCancelButtonText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// ESTILOS COMPLETOS
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
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
    paddingBottom: 30,
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  darkEmptyState: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginBottom: 2,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
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
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  darkInfoBox: {
    backgroundColor: '#2C2C2E',
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
    maxHeight: '90%',
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
  modalScroll: {
    maxHeight: 500,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  darkInput: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderColor: '#38383A',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 8,
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
    borderRadius: 12,
    padding: 18,
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
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    alignItems: 'center',
  },
  darkCancelButton: {
    backgroundColor: '#2C2C2E',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  darkCancelButtonText: {
    color: '#98989F',
  },
  pixInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  pixInfoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  pixTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pixTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F8FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  pixTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  darkPixTypeButton: {
    backgroundColor: '#2C2C2E',
    borderColor: '#38383A',
  },
  darkPixTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pixTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  pixTypeTextActive: {
    color: '#FFFFFF',
  },
  darkPixTypeText: {
    color: '#98989F',
  },
});

export default Pagamentos;