import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AboutScreen = () => {
    return (
        <View style={styles.container}>
        <Text style={styles.title}>About This App</Text>
        <Text style={styles.content}>
          Este aplicativo tem o intuito de facilitar a organização e o gerenciamento de pedidos em uma cantina escolar. Com ele, os alunos podem fazer seus pedidos de forma rápida e prática, enquanto os administradores podem acompanhar e gerenciar esses pedidos com eficiência.   
        </Text>
        <Text style={styles.content}>
            Version: 1.0.0
        </Text>
        <Text style={styles.content}>
        Criado por: Victor Hugo Figueira Reisswitz, Wesley Gabriel Bairros Correa, Kauan  Petry
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