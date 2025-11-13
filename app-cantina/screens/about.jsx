import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { useTheme } from '../context/themeContext';

export default function About(){
    // Use o contexto do tema
    const { darkMode } = useTheme();

    // Estilos dinâmicos simples
    const dynamicStyles = {
        container: {
            backgroundColor: darkMode ? '#000000' : '#FFFFFF',
        },
        title: {
            color: darkMode ? '#FFFFFF' : '#000000',
        },
        content: {
            color: darkMode ? '#FFFFFF' : '#000000',
        }
    };

    return(
        <View style={[styles.container, dynamicStyles.container]}>
            <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
            
            <Text style={[styles.title, dynamicStyles.title]}>
                Sobre o App Cantina
            </Text>
            <Text style={[styles.content, dynamicStyles.content]}>
                O App Cantina foi desenvolvido para facilitar as compras na cantina escolar. 
                Com ele, os alunos podem visualizar o cardápio, adicionar itens ao carrinho e 
                finalizar suas compras de forma rápida e segura.
            </Text>
            <Text style={[styles.content, dynamicStyles.content]}>
                Desenvolvido por Victor Hugo Figueira Reisswitz, Wesley Gabriel Bairros Correa e Kauan Petry, este aplicativo visa melhorar a experiência dos 
                usuários, proporcionando uma interface amigável e funcionalidades práticas.
            </Text>
            <Text style={[styles.content, dynamicStyles.content]}>
                Versão do App: 2.1.0
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    content: {
        fontSize: 16,
        marginBottom: 15,
        lineHeight: 22,
    },
});