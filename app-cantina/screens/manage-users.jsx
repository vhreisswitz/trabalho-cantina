import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/database';
import { useTheme } from '../context/themeContext';

export default function ManageUsers({ navigation, route }) {
  const { usuario } = route.params;
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    tipo: 'student',
    saldo: '0.00',
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
    filtro_inativo: darkMode ? '#334155' : '#F3F4F6'
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const filteredUsers = users.filter(user =>
    user.nome?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.matricula?.includes(searchText)
  );

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      matricula: '',
      tipo: 'student',
      saldo: '0.00',
    });
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const addNewUser = async () => {
    try {
      if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Por favor, informe o nome do usuário');
        return;
      }
      if (!formData.matricula.trim()) {
        Alert.alert('Erro', 'Por favor, informe a matrícula do usuário');
        return;
      }

      if (formData.email.trim()) {
        const emailExists = users.some(user => 
          user.email && user.email.toLowerCase() === formData.email.toLowerCase()
        );
        if (emailExists) {
          Alert.alert('Erro', 'Este email já está cadastrado');
          return;
        }
      }

      const matriculaExists = users.some(user => 
        user.matricula === formData.matricula
      );
      if (matriculaExists) {
        Alert.alert('Erro', 'Esta matrícula já está cadastrada');
        return;
      }

      const userToInsert = {
        nome: formData.nome,
        email: formData.email.trim() || null,
        matricula: formData.matricula,
        tipo: formData.tipo,
        saldo: parseFloat(formData.saldo) || 0,
        ativo: true,
        // Removendo created_at e updated_at se não existirem na tabela
      };

      const { data, error } = await supabase
        .from('usuarios')
        .insert([userToInsert])
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        
        // Tentar novamente sem campos que podem não existir
        const simplifiedUser = {
          nome: formData.nome,
          email: formData.email.trim() || null,
          matricula: formData.matricula,
          tipo: formData.tipo,
          saldo: parseFloat(formData.saldo) || 0,
          ativo: true,
        };
        
        const { data: data2, error: error2 } = await supabase
          .from('usuarios')
          .insert([simplifiedUser])
          .select();
          
        if (error2) throw error2;
        
        setUsers([...users, data2[0]]);
      } else {
        setUsers([...users, data[0]]);
      }
      
      resetForm();
      Alert.alert('Sucesso', 'Usuário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o usuário.');
    }
  };

  const updateUser = async () => {
    try {
      if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Por favor, informe o nome do usuário');
        return;
      }
      if (!formData.matricula.trim()) {
        Alert.alert('Erro', 'Por favor, informe a matrícula do usuário');
        return;
      }

      if (formData.email.trim()) {
        const emailExists = users.some(user => 
          user.id !== selectedUser.id && 
          user.email && 
          user.email.toLowerCase() === formData.email.toLowerCase()
        );
        if (emailExists) {
          Alert.alert('Erro', 'Este email já está cadastrado para outro usuário');
          return;
        }
      }

      const matriculaExists = users.some(user => 
        user.id !== selectedUser.id && 
        user.matricula === formData.matricula
      );
      if (matriculaExists) {
        Alert.alert('Erro', 'Esta matrícula já está cadastrada para outro usuário');
        return;
      }

      const updateData = {
        nome: formData.nome,
        email: formData.email.trim() || null,
        matricula: formData.matricula,
        tipo: formData.tipo,
        saldo: parseFloat(formData.saldo) || 0,
      };

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === selectedUser.id ? { ...user, ...formData, saldo: parseFloat(formData.saldo) || 0 } : user
      ));

      resetForm();
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o usuário.');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, ativo: !currentStatus } : user
      ));

      Alert.alert(
        'Sucesso',
        `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status do usuário.');
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert(
      'Excluir Usuário',
      'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', userId);

              if (error) throw error;

              setUsers(users.filter(user => user.id !== userId));
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o usuário.');
            }
          }
        }
      ]
    );
  };

  const selectUserForEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setFormData({
      nome: user.nome || '',
      email: user.email || '',
      matricula: user.matricula || '',
      tipo: user.tipo || 'student',
      saldo: user.saldo?.toString() || '0.00',
    });
  };

  const changeUserType = async (userId, currentType) => {
    const newType = currentType === 'admin' ? 'student' : 'admin';
    
    Alert.alert(
      'Alterar Tipo',
      `Deseja alterar o tipo de usuário para ${newType === 'admin' ? 'Administrador' : 'Estudante'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Alterar',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('usuarios')
                .update({ tipo: newType })
                .eq('id', userId);

              if (error) throw error;

              setUsers(users.map(user =>
                user.id === userId ? { ...user, tipo: newType } : user
              ));

              Alert.alert('Sucesso', `Tipo alterado para ${newType}!`);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível alterar o tipo.');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: CORES.card }]}
      onLongPress={() => deleteUser(item.id)}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={[styles.userName, { color: CORES.texto }]}>
            {item.nome}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[
              styles.typeBadge,
              { backgroundColor: item.tipo === 'admin' ? '#FF6B35' : '#005CA9' }
            ]}>
              <Text style={styles.typeText}>
                {item.tipo === 'admin' ? 'ADMIN' : 'ESTUDANTE'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.ativo ? '#34C759' : '#FF3B30' }
            ]}>
              <Text style={styles.statusText}>
                {item.ativo ? 'ATIVO' : 'INATIVO'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.userDetail, { color: CORES.texto_secundario }]}>
          📧 {item.email || 'Sem email'}
        </Text>
        <Text style={[styles.userDetail, { color: CORES.texto_secundario }]}>
          🆔 Matrícula: {item.matricula || 'N/A'}
        </Text>
        <Text style={[styles.userDetail, { color: CORES.texto_secundario }]}>
          💰 Saldo: R$ {item.saldo?.toFixed(2) || '0.00'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.editButton,
          ]}
          onPress={() => selectUserForEdit(item)}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.toggleButton,
            { backgroundColor: item.ativo ? '#FF3B30' : '#34C759' }
          ]}
          onPress={() => toggleUserStatus(item.id, item.ativo)}
        >
          <Ionicons
            name={item.ativo ? 'close-circle' : 'checkmark-circle'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {item.ativo ? 'Desativar' : 'Ativar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.typeButton,
            { backgroundColor: item.tipo === 'admin' ? '#005CA9' : '#FF6B35' }
          ]}
          onPress={() => changeUserType(item.id, item.tipo)}
        >
          <Ionicons
            name="swap-horizontal"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {item.tipo === 'admin' ? 'Estudante' : 'Admin'}
          </Text>
        </TouchableOpacity>
      </View>
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
    searchInput: {
      backgroundColor: darkMode ? '#2C2C2E' : '#F3F4F6',
      color: CORES.texto,
      borderColor: CORES.borda,
    },
    statsCard: {
      backgroundColor: CORES.card,
    },
    statsLabel: {
      color: CORES.texto_secundario,
    },
    statsValue: {
      color: CORES.texto,
    },
    formCard: {
      backgroundColor: CORES.card,
    },
    formLabel: {
      color: CORES.texto,
    },
    formInput: {
      backgroundColor: darkMode ? '#2C2C2E' : '#F3F4F6',
      color: CORES.texto,
      borderColor: CORES.borda,
    }
  };

  const stats = {
    total: users.length,
    ativos: users.filter(u => u.ativo).length,
    inativos: users.filter(u => !u.ativo).length,
    admins: users.filter(u => u.tipo === 'admin').length,
    students: users.filter(u => u.tipo === 'student').length
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Gerenciar Usuários</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primaria} />
          <Text style={[styles.loadingText, { color: CORES.texto_secundario }]}>
            Carregando usuários...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Gerenciar Usuários</Text>
          <TouchableOpacity onPress={loadUsers} style={styles.headerButton}>
            <Ionicons name="refresh" size={24} color={CORES.primaria} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsContainer, dynamicStyles.statsCard]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dynamicStyles.statsValue]}>{stats.total}</Text>
            <Text style={[styles.statLabel, dynamicStyles.statsLabel]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.ativos}</Text>
            <Text style={[styles.statLabel, dynamicStyles.statsLabel]}>Ativos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>{stats.inativos}</Text>
            <Text style={[styles.statLabel, dynamicStyles.statsLabel]}>Inativos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF6B35' }]}>{stats.admins}</Text>
            <Text style={[styles.statLabel, dynamicStyles.statsLabel]}>Admins</Text>
          </View>
        </View>

        <View style={[styles.formContainer, dynamicStyles.formCard]}>
          <Text style={[styles.formTitle, { color: CORES.texto }]}>
            {isEditing ? `Editando: ${selectedUser?.nome}` : 'Adicionar Novo Usuário'}
          </Text>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, dynamicStyles.formLabel]}>Nome *</Text>
              <TextInput
                style={[styles.formInput, dynamicStyles.formInput]}
                value={formData.nome}
                onChangeText={(text) => handleInputChange('nome', text)}
                placeholder="Nome completo"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, dynamicStyles.formLabel]}>Email (opcional)</Text>
              <TextInput
                style={[styles.formInput, dynamicStyles.formInput]}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, dynamicStyles.formLabel]}>Matrícula *</Text>
              <TextInput
                style={[styles.formInput, dynamicStyles.formInput]}
                value={formData.matricula}
                onChangeText={(text) => handleInputChange('matricula', text)}
                placeholder="Matrícula"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, dynamicStyles.formLabel]}>Saldo (R$)</Text>
              <TextInput
                style={[styles.formInput, dynamicStyles.formInput]}
                value={formData.saldo}
                onChangeText={(text) => handleInputChange('saldo', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, dynamicStyles.formLabel]}>Tipo</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { 
                      backgroundColor: formData.tipo === 'student' ? CORES.primaria : CORES.filtro_inativo,
                      borderColor: CORES.borda
                    }
                  ]}
                  onPress={() => handleInputChange('tipo', 'student')}
                >
                  <Text style={[
                    styles.typeOptionText,
                    { color: formData.tipo === 'student' ? '#FFFFFF' : CORES.texto }
                  ]}>
                    Estudante
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { 
                      backgroundColor: formData.tipo === 'admin' ? '#FF6B35' : CORES.filtro_inativo,
                      borderColor: CORES.borda
                    }
                  ]}
                  onPress={() => handleInputChange('tipo', 'admin')}
                >
                  <Text style={[
                    styles.typeOptionText,
                    { color: formData.tipo === 'admin' ? '#FFFFFF' : CORES.texto }
                  ]}>
                    Administrador
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.formActions}>
            {isEditing && (
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={isEditing ? updateUser : addNewUser}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "add"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Salvar Alterações' : 'Adicionar Usuário'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={CORES.texto_secundario} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Buscar por nome, email ou matrícula..."
            placeholderTextColor={CORES.texto_secundario}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={CORES.texto_secundario} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[CORES.primaria]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={CORES.texto_secundario} />
              <Text style={[styles.emptyText, { color: CORES.texto }]}>
                {searchText.length > 0 
                  ? 'Nenhum usuário encontrado' 
                  : 'Nenhum usuário cadastrado'
                }
              </Text>
              <Text style={[styles.emptySubtext, { color: CORES.texto_secundario }]}>
                {searchText.length > 0 
                  ? 'Tente buscar com outros termos'
                  : 'Os usuários aparecerão aqui quando forem cadastrados'
                }
              </Text>
            </View>
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005CA9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    padding: 4,
  },
  headerRight: {
    width: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formGroup: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  formButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 48,
    fontSize: 16,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#005CA9',
  },
  toggleButton: {
    backgroundColor: '#FF3B30',
  },
  typeButton: {
    backgroundColor: '#005CA9',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});