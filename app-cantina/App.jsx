import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SaldoProvider } from './hooks/useSaldo';
import { ThemeProvider } from './context/themeContext';
import Login from './screens/login';
import Home from './screens/home';
import RecarregarSaldo from './screens/RecarregarSaldo';
import Carrinho from './screens/carrinho';
import Configuracoes from './screens/settings';
import Sobre from './screens/about';
import Extrato from './screens/extrato';
import AdminDashboard from './screens/admin-dashboard';
import ManageProducts from './screens/manage-products';
import ManageUsers from './screens/manage-users';
import SalesReports from './screens/sales-reports'
import ExtratoScreen from './screens/extrato';
import Pagamentos from './screens/Pagamentos';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <SaldoProvider>
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
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="RecarregarSaldo"
              component={RecarregarSaldo}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Carrinho"
              component={Carrinho}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Configuracoes"
              component={Configuracoes}
              options={{
                animation: 'slide_from_left',
              }}
            />
            <Stack.Screen
              name="Sobre"
              component={Sobre}
              options={{
                animation: 'fade_from_bottom',
              }}
            />
            <Stack.Screen
              name="Extrato"
              component={ExtratoScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ManageProducts"
              component={ManageProducts}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ManageUsers"
              component={ManageUsers}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="SalesReports"
              component={SalesReports}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="PaymentMethods"  // ← ESTE É O NOME
              component={Pagamentos}
              options={{
                title: 'Métodos de Pagamento',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
              }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SaldoProvider>
    </ThemeProvider>
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