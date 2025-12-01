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
  Modal,
  ScrollView
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !currentStatus })
        .update({ updated_at: new Date().toISOString() })
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

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setEditData({
      nome: user.nome,
      email: user.email,
      matricula: user.matricula,
      tipo: user.tipo
    });
    setModalVisible(true);
    setEditMode(false);
  };

  const updateUser = async () => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: editData.nome,
          email: editData.email,
          matricula: editData.matricula,
          tipo: editData.tipo,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === selectedUser.id ? { ...user, ...editData } : user
      ));

      setSelectedUser({ ...selectedUser, ...editData });
      setEditMode(false);
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o usuário.');
    }
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

              if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, tipo: newType });
              }

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
      onPress={() => viewUserDetails(item)}
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
            {item.tipo === 'admin' ? 'Tornar Estudante' : 'Tornar Admin'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const UserDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: CORES.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: CORES.texto }]}>
              {editMode ? 'Editar Usuário' : 'Detalhes do Usuário'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={CORES.texto_secundario} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {editMode ? (
              <>
                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: CORES.texto }]}>Nome:</Text>
                  <TextInput
                    style={[styles.editInput, { 
                      backgroundColor: darkMode ? '#2C2C2E' : '#F3F4F6',
                      color: CORES.texto,
                      borderColor: CORES.borda
                    }]}
                    value={editData.nome}
                    onChangeText={(text) => setEditData({ ...editData, nome: text })}
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: CORES.texto }]}>Email:</Text>
                  <TextInput
                    style={[styles.editInput, { 
                      backgroundColor: darkMode ? '#2C2C2E' : '#F3F4F6',
                      color: CORES.texto,
                      borderColor: CORES.borda
                    }]}
                    value={editData.email}
                    onChangeText={(text) => setEditData({ ...editData, email: text })}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: CORES.texto }]}>Matrícula:</Text>
                  <TextInput
                    style={[styles.editInput, { 
                      backgroundColor: darkMode ? '#2C2C2E' : '#F3F4F6',
                      color: CORES.texto,
                      borderColor: CORES.borda
                    }]}
                    value={editData.matricula}
                    onChangeText={(text) => setEditData({ ...editData, matricula: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: CORES.texto }]}>Tipo:</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { 
                          backgroundColor: editData.tipo === 'student' ? CORES.primaria : CORES.filtro_inativo,
                          borderColor: CORES.borda
                        }
                      ]}
                      onPress={() => setEditData({ ...editData, tipo: 'student' })}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        { color: editData.tipo === 'student' ? '#FFFFFF' : CORES.texto }
                      ]}>
                        Estudante
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { 
                          backgroundColor: editData.tipo === 'admin' ? '#FF6B35' : CORES.filtro_inativo,
                          borderColor: CORES.borda
                        }
                      ]}
                      onPress={() => setEditData({ ...editData, tipo: 'admin' })}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        { color: editData.tipo === 'admin' ? '#FFFFFF' : CORES.texto }
                      ]}>
                        Administrador
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>Nome:</Text>
                  <Text style={[styles.detailValue, { color: CORES.texto }]}>{selectedUser?.nome}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>Email:</Text>
                  <Text style={[styles.detailValue, { color: CORES.texto }]}>{selectedUser?.email || 'Não informado'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>Matrícula:</Text>
                  <Text style={[styles.detailValue, { color: CORES.texto }]}>{selectedUser?.matricula || 'Não informada'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>Tipo:</Text>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: selectedUser?.tipo === 'admin' ? '#FF6B35' : '#005CA9' }
                  ]}>
                    <Text style={styles.typeText}>
                      {selectedUser?.tipo === 'admin' ? 'ADMINISTRADOR' : 'ESTUDANTE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>Status:</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedUser?.ativo ? '#34C759' : '#FF3B30' }
                  ]}>
                    <Text style={styles.statusText}>
                      {selectedUser?.ativo ? 'ATIVO' : 'INATIVO'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>Saldo:</Text>
                  <Text style={[styles.detailValue, { color: CORES.texto }]}>
                    R$ {selectedUser?.saldo?.toFixed(2) || '0.00'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: CORES.texto_secundario }]}>ID:</Text>
                  <Text style={[styles.detailValue, { color: CORES.texto }]}>{selectedUser?.id}</Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            {editMode ? (
              <>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditMode(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={updateUser}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.modalButton, styles.editButton]}
                  onPress={() => setEditMode(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
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
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Gerenciar Usuários</Text>
        <TouchableOpacity onPress={loadUsers}>
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

      <UserDetailsModal />
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
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005CA9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#005CA9',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
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
  closeButton: {
    backgroundColor: '#6B7280',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  editInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});