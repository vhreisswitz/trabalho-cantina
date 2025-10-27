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
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="RecarregarSaldo" component={RecarregarSaldo} />
        <Stack.Screen name="Carrinho" component={Carrinho} />
        {/* <Stack.Screen name="Configura" component={Configuracoes}/> */}
        {/* <Stack.Screen name="Sobre" component={Sobre} /> */}
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