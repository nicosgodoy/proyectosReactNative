import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerMovimientos, Movimiento } from '../database/database';
import MovementCard from '../components/MovementCard';

export default function MovimientosScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      cargarMovimientos();
    }, [])
  );

  const cargarMovimientos = async () => {
    try {
      const movs = await obtenerMovimientos();
      setMovimientos(movs);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      Alert.alert('Error', 'No se pudieron cargar los movimientos');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarMovimientos();
    setRefreshing(false);
  };

  const handleMovimientoActualizado = () => {
    cargarMovimientos();
  };

  const renderMovimiento = ({ item }: { item: Movimiento }) => (
    <MovementCard 
      movimiento={item} 
      onMovimientoActualizado={handleMovimientoActualizado}
    />
  );

  return (
    <View style={styles.container}>
      {movimientos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay movimientos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={movimientos}
          renderItem={renderMovimiento}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});