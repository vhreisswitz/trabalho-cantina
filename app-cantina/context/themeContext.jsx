import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

// Criando o contexto
const ThemeContext = createContext();

// Hook personalizado para usar o contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Provedor do contexto
export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [darkMode, setDarkMode] = useState(false);

  // Debug
  useEffect(() => {
    console.log('Tema atual:', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Função para alternar o tema - CORRIGIDA
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Função para definir tema específico - CORRIGIDA
  const setTheme = (value) => {
    setDarkMode(value);
  };

  // Valor do contexto - CORRIGIDO
  const value = {
    darkMode,
    setDarkMode,
    toggleTheme,
    setTheme,
    isDark: darkMode, // Para compatibilidade
    theme: darkMode ? 'dark' : 'light' // Para compatibilidade
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;