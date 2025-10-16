import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aokmqmjavidwfxceehvs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva21xbWphdmlkd2Z4Y2VlaHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2ODU1MjMsImV4cCI6MjA0OTI2MTUyM30.8A6eQ0bXw1Y4X6e7Q2Q5Xw7Z8X9Y0Z1A2B3C4D5E6F7G8H9I0J";

export const supabase = createClient(supabaseUrl, supabaseKey);

export default function CantinaApp() {
  const [usuarios, setUsuarios] = useState([]);
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [editId, setEditId] = useState(null);

  const [historico, setHistorico] = useState([]);
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valor, setValor] = useState("");

  // 🟢 CARREGAR USUÁRIOS
  async function carregarUsuarios() {
    const { data } = await supabase.from("usuarios").select("*");
    setUsuarios(data || []);
  }

  // 🟢 CARREGAR HISTÓRICO
  async function carregarHistorico() {
    const { data } = await supabase
      .from("historico_compras")
      .select("*, usuarios(matricula)")
      .order("data_compra", { ascending: false });
    setHistorico(data || []);
  }

  useEffect(() => {
    carregarUsuarios();
    carregarHistorico();
  }, []);

  // 🟢 ADICIONAR USUÁRIO
  async function adicionarUsuario() {
    if (!matricula || !senha) return alert("Preencha os campos!");
    await supabase.from("usuarios").insert([{ matricula, senha }]);
    setMatricula("");
    setSenha("");
    carregarUsuarios();
  }

  // 🟢 ATUALIZAR USUÁRIO
  async function atualizarUsuario() {
    await supabase
      .from("usuarios")
      .update({ matricula, senha })
      .eq("id", editId);
    setEditId(null);
    setMatricula("");
    setSenha("");
    carregarUsuarios();
  }

  // 🟢 EXCLUIR USUÁRIO
  async function deletarUsuario(id) {
    await supabase.from("usuarios").delete().eq("id", id);
    carregarUsuarios();
  }

  // 🟢 ADICIONAR COMPRA AO HISTÓRICO
  async function registrarCompra() {
    if (!item || !valor) return alert("Preencha todos os campos!");
    const usuarioSelecionado = usuarios[0]; // exemplo: usa o primeiro usuário
    await supabase.from("historico_compras").insert([
      {
        usuario_id: usuarioSelecionado.id,
        item,
        quantidade,
        valor,
      },
    ]);
    setItem("");
    setQuantidade(1);
    setValor("");
    carregarHistorico();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>CRUD de Usuários</h2>
      <input
        placeholder="Matrícula"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        placeholder="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ marginRight: 10 }}
      />
      {editId ? (
        <button onClick={atualizarUsuario}>Atualizar</button>
      ) : (
        <button onClick={adicionarUsuario}>Adicionar</button>
      )}

      <ul style={{ marginTop: 20 }}>
        {usuarios.map((u) => (
          <li key={u.id}>
            <b>{u.matricula}</b> - {u.senha}
            <button
              onClick={() => {
                setEditId(u.id);
                setMatricula(u.matricula);
                setSenha(u.senha);
              }}
              style={{ marginLeft: 10 }}
            >
              Editar
            </button>
            <button
              onClick={() => deletarUsuario(u.id)}
              style={{ marginLeft: 5 }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: "20px 0" }} />

      <h2>Histórico de Compras</h2>
      <input
        placeholder="Item"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        type="number"
        placeholder="Qtd"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        style={{ marginRight: 10, width: 70 }}
      />
      <input
        type="number"
        step="0.01"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{ marginRight: 10, width: 90 }}
      />
      <button onClick={registrarCompra}>Registrar</button>

      <ul style={{ marginTop: 20 }}>
        {historico.map((h) => (
          <li key={h.id}>
            {h.usuarios?.matricula} comprou <b>{h.item}</b> (
            {h.quantidade}x) — R${h.valor} em{" "}
            {new Date(h.data_compra).toLocaleString("pt-BR")}
          </li>
        ))}
      </ul>
    </div>
  );
}
