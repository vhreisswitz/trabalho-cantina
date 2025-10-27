import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function Profile({ route }) {
    const {usuario} = route.params;
    return (
        <View style={styles.container}>
            <Image source={app-cantina/assets/profile.png} style={styles.image} />
            <Text style={styles.text}>Perfil do Usuário</Text>
            <Text style={styles.info}>Nome: {usuario.nome}</Text>
            <Text style={styles.info}>Saldo: R$ {usuario.saldo.toFixed(2)}</Text>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    info: {
        fontSize: 18,
        marginVertical: 5,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
})