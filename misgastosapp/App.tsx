import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from './database/database';
import TabNavigator from './navigation/TabNavigator';
import SaldoInicialScreen from './screens/SaldoInicialScreen';


export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tieneSaldoInicial, setTieneSaldoInicial] = useState<boolean>(false);

  useEffect(() => {
    inicializarApp();
  }, []);

  const inicializarApp = async (): Promise<void> => {
    try {
      await initDatabase();
      const saldo = await verificarSaldoInicial();
      setTieneSaldoInicial(saldo !== null);
    } catch (error) {
      console.error('Error al inicializar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verificarSaldoInicial = async (): Promise<number | null> => {
    const { verificarSaldoInicial: verificar } = await import("./database/database");
    return await verificar();
  };
  const handleSaldoGuardado = (): void => {
    setTieneSaldoInicial(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!tieneSaldoInicial) {
    return <SaldoInicialScreen onSaldoGuardado={handleSaldoGuardado} />;
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});