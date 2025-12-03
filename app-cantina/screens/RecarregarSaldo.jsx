import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from "../context/themeContext";

export default function RecarregarSaldo({ navigation, route }) {
  const { darkMode } = useTheme();
  const usuario = route.params?.usuario;
  const onSaldoAtualizado = route.params?.onSaldoAtualizado;

  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState(null);
  const [gerando, setGerando] = useState(false);

  const CORES = {
    fundo: darkMode ? "#0d1117" : "#ffffff",
    card: darkMode ? "#161b22" : "#f6f6f6",
    texto: darkMode ? "#f0f6fc" : "#1a1a1a",
    azul: darkMode ? "#58a6ff" : "#005CA9",
    borda: darkMode ? "#30363d" : "#d5d5d5",
    placeholder: darkMode ? "#8b949e" : "#5f6b7a",
    verde: darkMode ? "#2ea043" : "#2ecc71",
    laranja: darkMode ? "#f78166" : "#ff6b35"
  };

  // Gera código PIX simulado
  function gerarPix() {
    if (!valor || isNaN(valor)) return;
    setGerando(true);

    setTimeout(() => {
      setGerando(false);
      setMetodo("pix-gerado");
    }, 1500);
  }

  // Finalizar por cartão
  function pagarCartao() {
    if (!valor || isNaN(valor)) return;

    const novoSaldo = usuario.saldo + Number(valor);
    onSaldoAtualizado(novoSaldo);

    navigation.goBack();
  }

  const pixCopiaCola = `00020101021226880014BR.GOV.BCB.PIX0136email-do-senai@pagamentos.com520400005303986540${valor.padStart(2, "0")}5802BR5920SENAI Palhoça Cantina6009Palhoca62070503***6304ABCD`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: CORES.fundo }]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.titulo, { color: CORES.texto }]}>
        💰 Recarregar Saldo
      </Text>

      <View style={[styles.card, { backgroundColor: CORES.card, borderColor: CORES.borda }]}>
        <Text style={[styles.label, { color: CORES.texto }]}>Valor da Recarga</Text>

        <TextInput
          style={[styles.input, { color: CORES.texto, borderColor: CORES.borda }]}
          placeholder="Digite o valor (ex: 20)"
          placeholderTextColor={CORES.placeholder}
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />

        <Text style={[styles.label, { color: CORES.texto, marginTop: 16 }]}>
          Selecione o método
        </Text>

        {/* Escolha de método */}
        <View style={styles.metodos}>
          <TouchableOpacity
            style={[
              styles.botaoMetodo,
              { borderColor: metodo === "pix" ? CORES.azul : CORES.borda }
            ]}
            onPress={() => setMetodo("pix")}
          >
            <Text style={{ color: CORES.texto }}>PIX</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoMetodo,
              { borderColor: metodo === "cartao" ? CORES.azul : CORES.borda }
            ]}
            onPress={() => setMetodo("cartao")}
          >
            <Text style={{ color: CORES.texto }}>Cartão de Crédito</Text>
          </TouchableOpacity>
        </View>

        {/* PIX */}
        {metodo === "pix" && (
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.botaoGerar, { backgroundColor: CORES.azul }]}
              onPress={gerarPix}
            >
              <Text style={styles.botaoGerarText}>Gerar PIX</Text>
            </TouchableOpacity>

            {gerando && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={CORES.azul} />
                <Text style={{ color: CORES.texto, marginTop: 10 }}>Gerando PIX...</Text>
              </View>
            )}

            {metodo === "pix-gerado" && (
              <View style={styles.pixBox}>
                <Text style={[styles.subtitulo, { color: CORES.texto }]}>
                  Escaneie o QR Code
                </Text>

                <View style={styles.qrcodeBox}>
                  <QRCode
                    value={pixCopiaCola}
                    size={180}
                    color={darkMode ? "#ffffff" : "#000000"}
                    backgroundColor={CORES.card}
                  />
                </View>

                <Text style={[styles.subtitulo, { color: CORES.texto, marginTop: 18 }]}>
                  PIX Copia e Cola
                </Text>

                <View style={[styles.copiaColaBox, { borderColor: CORES.borda }]}>
                  <Text selectable style={[styles.copiaColaText, { color: CORES.texto }]}>
                    {pixCopiaCola}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.confirmar, { backgroundColor: CORES.verde }]}
                  onPress={() => {
                    const novoSaldo = usuario.saldo + Number(valor);
                    onSaldoAtualizado(novoSaldo);
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.confirmarText}>Confirmar Pagamento</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Cartão */}
        {metodo === "cartao" && (
          <View style={{ marginTop: 20 }}>
            <TextInput
              style={[styles.input, { color: CORES.texto, borderColor: CORES.borda }]}
              placeholder="Número do cartão"
              placeholderTextColor={CORES.placeholder}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { color: CORES.texto, borderColor: CORES.borda }]}
              placeholder="Nome no cartão"
              placeholderTextColor={CORES.placeholder}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={[styles.inputMini, { color: CORES.texto, borderColor: CORES.borda }]}
                placeholder="MM/AA"
                placeholderTextColor={CORES.placeholder}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.inputMini, { color: CORES.texto, borderColor: CORES.borda }]}
                placeholder="CVV"
                placeholderTextColor={CORES.placeholder}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmar, { backgroundColor: CORES.azul }]}
              onPress={pagarCartao}
            >
              <Text style={styles.confirmarText}>Pagar com Cartão</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputMini: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  metodos: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  botaoMetodo: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
  },
  botaoGerar: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoGerarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loading: {
    alignItems: "center",
    marginTop: 20,
  },
  pixBox: { marginTop: 20, alignItems: "center" },
  qrcodeBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  copiaColaBox: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  copiaColaText: { fontSize: 12 },
  subtitulo: {
    fontSize: 16,
    fontWeight: "700",
  },
  confirmar: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
