import { useState } from 'react';
import { supabase } from './services/database.jsx'; // ajuste o caminho conforme sua estrutura

export function VerificarUsuario() {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: ''
  });
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Função para lidar com mudanças nos inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função que executa a verificação no Supabase
  async function verificarUsuario() {
    if (!formData.nome || !formData.matricula) {
      alert('Por favor, preencha nome e matrícula!');
      return;
    }

    setCarregando(true);
    setResultado(null);

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nome', formData.nome)
        .eq('matricula', formData.matricula);

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        setResultado({
          status: 'ERRO',
          mensagem: 'Erro ao consultar o banco de dados',
          usuario: null
        });
        return;
      }

      if (data && data.length > 0) {
        setResultado({
          status: 'ENCONTRADO',
          mensagem: '✅ Usuário encontrado com sucesso!',
          usuario: data[0]
        });
      } else {
        setResultado({
          status: 'NAO_ENCONTRADO',
          mensagem: '❌ Usuário não encontrado!',
          usuario: null
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setResultado({
        status: 'ERRO',
        mensagem: 'Erro interno do sistema',
        usuario: null
      });
    } finally {
      setCarregando(false);
    }
  }

  // Função para limpar o formulário
  const limparFormulario = () => {
    setFormData({ nome: '', matricula: '' });
    setResultado(null);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.titulo}>🔍 Verificar Usuário</h3>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Nome:
          <input
            type="text"
            name="nome"
            placeholder="Digite o nome"
            value={formData.nome}
            onChange={handleInputChange}
            style={styles.input}
            disabled={carregando}
          />
        </label>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Matrícula:
          <input
            type="text"
            name="matricula"
            placeholder="Digite a matrícula"
            value={formData.matricula}
            onChange={handleInputChange}
            style={styles.input}
            disabled={carregando}
          />
        </label>
      </div>

      <div style={styles.botoes}>
        <button 
          onClick={verificarUsuario} 
          style={styles.botaoVerificar}
          disabled={carregando}
        >
          {carregando ? '🔎 Verificando...' : 'Verificar Usuário'}
        </button>
        
        <button 
          onClick={limparFormulario} 
          style={styles.botaoLimpar}
          disabled={carregando}
        >
          Limpar
        </button>
      </div>

      {/* Resultado da consulta */}
      {resultado && (
        <div style={{
          ...styles.resultado,
          ...(resultado.status === 'ENCONTRADO' ? styles.sucesso : 
              resultado.status === 'NAO_ENCONTRADO' ? styles.erro : 
              styles.alerta)
        }}>
          <h4>{resultado.mensagem}</h4>
          
          {resultado.usuario && (
            <div style={styles.detalhesUsuario}>
              <p><strong>ID:</strong> {resultado.usuario.id}</p>
              <p><strong>Nome:</strong> {resultado.usuario.nome}</p>
              <p><strong>Matrícula:</strong> {resultado.usuario.matricula}</p>
              {resultado.usuario.senha && (
                <p><strong>Senha:</strong> {resultado.usuario.senha}</p>
              )}
              {resultado.usuario.criado_em && (
                <p><strong>Cadastrado em:</strong> {new Date(resultado.usuario.criado_em).toLocaleString('pt-BR')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Estilos para o componente
const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '20px auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  titulo: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '5px'
  },
  botoes: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  botaoVerificar: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  botaoLimpar: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  resultado: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '4px',
    border: '1px solid'
  },
  sucesso: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    color: '#155724'
  },
  erro: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    color: '#721c24'
  },
  alerta: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    color: '#856404'
  },
  detalhesUsuario: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '4px'
  }
};

export default VerificarUsuario;