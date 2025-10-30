import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// esta parte é especifica para importar as telas.
import Login from './screens/login';
import Home from './screens/home';
import RecarregarSaldo from './screens/RecarregarSaldo';
import Carrinho from './screens/carrinho';
import Configuracoes from './screens/settings';
import Sobre from './screens/about';
import Perfil from './screens/profile';
import Extrato from './screens/extrato';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            animation: 'fade', // Transição suave para o login
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            animation: 'slide_from_bottom', // Entrada da home vindo de baixo
          }}
        />
        <Stack.Screen
          name="RecarregarSaldo"
          component={RecarregarSaldo}
          options={{
            animation: 'slide_from_right', // Mantém o deslize da direita
          }}
        />
        <Stack.Screen
          name="Carrinho"
          component={Carrinho}
          options={{
            animation: 'slide_from_right', // Mantém o deslize da direita
          }}
        />
        <Stack.Screen
          name="Configuracoes"
          component={Configuracoes}
          options={{
            animation: 'slide_from_left', // Diferente para configurações
          }}
        />
        <Stack.Screen
          name="Sobre"
          component={Sobre}
          options={{
            animation: 'fade_from_bottom', // Transição suave para sobre
          }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{
            animation: 'slide_from_right', // Transição padrão para perfil
          }}
        />
        <Stack.Screen
          name='Extrato'
          component={Extrato}
          options={{
            animation: 'slide_from_right', // Transição padrão para extrato
          }}
        />
      </Stack.Navigator>
      {/* ✅ FIM DO NAVIGATOR */}

      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});