// Componente de Verificação de Usuário CORRIGIDO
function VerificarUsuario({ isDarkMode }) {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: ''
  });
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const validarNome = (nome) => /^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome.trim());
  const validarMatricula = (matricula) => /^[0-9]{6,}$/.test(matricula);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔥 VERIFICAÇÃO MELHORADA
  async function verificarUsuario() {
    if (!formData.nome && !formData.matricula) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos um campo!');
      return;
    }

    setCarregando(true);
    setResultado(null);

    try {
      let query = supabase.from('usuarios').select('*');
      
      // Busca flexível - por nome OU matrícula
      if (formData.nome.trim()) {
        query = query.ilike('nome', `%${formData.nome.trim()}%`); // Busca parcial
      }
      
      if (formData.matricula) {
        query = query.eq('matricula', formData.matricula); // Busca exata
      }

      const { data: usuarios, error } = await query;

      if (error) {
        throw error;
      }

      if (usuarios && usuarios.length > 0) {
        // 🎉 USUÁRIO(S) ENCONTRADO(S)
        setResultado({
          status: 'ENCONTRADO',
          mensagem: `✅ ${usuarios.length} usuário(s) encontrado(s)!`,
          usuarios: usuarios
        });
      } else {
        setResultado({
          status: 'NAO_ENCONTRADO',
          mensagem: '❌ Nenhum usuário encontrado com os dados fornecidos.',
          usuarios: null
        });
      }

    } catch (err) {
      console.error('Erro na consulta:', err);
      setResultado({
        status: 'ERRO',
        mensagem: 'Erro ao consultar o banco de dados',
        usuarios: null
      });
    } finally {
      setCarregando(false);
    }
  }

  const limparVerificacao = () => {
    setFormData({ nome: '', matricula: '' });
    setResultado(null);
  };

  return (
    <View style={[styles.verificacaoContainer, isDarkMode && styles.darkVerificacaoContainer]}>
      <Text style={[styles.verificacaoTitle, isDarkMode && styles.darkText]}>
        🔍 Verificar Usuário
      </Text>

      <Text style={[styles.instrucoes, isDarkMode && styles.darkText]}>
        Preencha pelo menos um campo para buscar
      </Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Nome (busca parcial)"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={formData.nome}
        onChangeText={(value) => handleInputChange('nome', value)}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Matrícula (busca exata)"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        keyboardType="numeric"
        value={formData.matricula}
        onChangeText={(value) => handleInputChange('matricula', value)}
      />

      <View style={styles.verificacaoBotoes}>
        <TouchableOpacity 
          style={[styles.button, styles.verificarButton, carregando && styles.buttonDisabled]} 
          onPress={verificarUsuario}
          disabled={carregando || (!formData.nome && !formData.matricula)}
        >
          <Text style={styles.buttonText}>
            {carregando ? '🔎 Buscando...' : '📋 Buscar Usuário'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.limparButton]} 
          onPress={limparVerificacao}
          disabled={carregando}
        >
          <Text style={styles.buttonText}>🔄 Limpar</Text>
        </TouchableOpacity>
      </View>

      {resultado && (
        <View style={[
          styles.resultadoContainer,
          resultado.status === 'ENCONTRADO' && styles.resultadoSucesso,
          resultado.status === 'NAO_ENCONTRADO' && styles.resultadoErro,
          resultado.status === 'ERRO' && styles.resultadoAlerta,
        ]}>
          <Text style={styles.resultadoMensagem}>{resultado.mensagem}</Text>
          
          {resultado.usuarios && resultado.usuarios.map((usuario, index) => (
            <View key={usuario.id || index} style={styles.detalhesUsuario}>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>ID:</Text> {usuario.id}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Nome:</Text> {usuario.nome}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Matrícula:</Text> {usuario.matricula}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Email:</Text> {usuario.email || 'Não informado'}
              </Text>
              <Text style={styles.detalhesTexto}>
                <Text style={styles.detalhesLabel}>Cadastrado em:</Text> {' '}
                {new Date(usuario.criado_em).toLocaleString('pt-BR')}
              </Text>
              {index < resultado.usuarios.length - 1 && <View style={styles.separador} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}