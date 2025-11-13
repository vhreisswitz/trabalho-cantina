import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function About(){
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Sobre o App Cantina</Text>
            <Text style={styles.content}>
                O App Cantina foi desenvolvido para facilitar as compras na cantina escolar. 
                Com ele, os alunos podem visualizar o cardápio, adicionar itens ao carrinho e 
                finalizar suas compras de forma rápida e segura.
            </Text>
            <Text style={styles.content}>
                Desenvolvido por Victor Hugo Figueira Reisswitz, Wesley Gabriel Bairros Correa e Kauan Petry, este aplicativo visa melhorar a experiência dos 
                usuários, proporcionando uma interface amigável e funcionalidades práticas.
            </Text>
            <Text style={styles.content}>
                Versão do App: 1.0.0
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        marginBottom: 10,
    },
})