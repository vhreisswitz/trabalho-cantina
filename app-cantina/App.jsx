import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './ThemeContext';

// telas
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
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,      // remove o header
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >

          {/* LOGIN */}
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              animation: 'fade',
            }}
          />

          {/* HOME */}
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              animation: 'slide_from_bottom',
            }}
          />

          {/* RECARREGAR SALDO */}
          <Stack.Screen
            name="RecarregarSaldo"
            component={RecarregarSaldo}
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* CARRINHO */}
          <Stack.Screen
            name="Carrinho"
            component={Carrinho}
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* CONFIGURAÇÕES */}
          <Stack.Screen
            name="Configuracoes"
            component={Configuracoes}
            options={{
              animation: 'slide_from_left',
            }}
          />

          {/* SOBRE */}
          <Stack.Screen
            name="Sobre"
            component={Sobre}
            options={{
              animation: 'fade_from_bottom',
            }}
          />

          {/* PERFIL */}
          <Stack.Screen
            name="Perfil"
            component={Perfil}
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* EXTRATO */}
          <Stack.Screen
            name="Extrato"
            component={Extrato}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>

        <StatusBar style="auto" />
      </NavigationContainer>
    </ThemeProvider>
  );
}
