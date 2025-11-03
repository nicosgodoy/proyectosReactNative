import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { calcularSaldoActual, obtenerMovimientos, Movimiento } from '../database/database';

export default function HomeScreen() {
  const [saldoActual, setSaldoActual] = useState<number>(0);
  const [ultimosMovimientos, setUltimosMovimientos] = useState<Movimiento[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      const saldo = await calcularSaldoActual();
      setSaldoActual(saldo);

      const movimientos = await obtenerMovimientos(7);
      setUltimosMovimientos(movimientos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const formatearMonto = (monto: number): string => {
    return `$${monto.toFixed(2)}`;
  };

  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderMovimiento = ({ item }: { item: Movimiento }) => (
    <View style={styles.movimientoCard}>
      <View style={styles.movimientoInfo}>
        <Text style={styles.categoriaTexto}>{item.categoria_nombre}</Text>
        <Text style={styles.fechaTexto}>{formatearFecha(item.fecha)}</Text>
      </View>
      <Text
        style={[
          styles.montoTexto,
          item.tipo === 'ingreso' ? styles.ingreso : styles.gasto,
        ]}
      >
        {item.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(item.monto)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.saldoContainer}>
        <Text style={styles.saldoLabel}>Saldo Actual</Text>
        <Text style={styles.saldoMonto}>{formatearMonto(saldoActual)}</Text>
      </View>

      <View style={styles.movimientosContainer}>
        <Text style={styles.seccionTitulo}>Últimos Movimientos</Text>
        {ultimosMovimientos.length === 0 ? (
          <Text style={styles.sinMovimientos}>No hay movimientos registrados</Text>
        ) : (
          <FlatList
            data={ultimosMovimientos}
            renderItem={renderMovimiento}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  saldoContainer: {
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  saldoMonto: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  movimientosContainer: {
    flex: 1,
    padding: 15,
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  movimientoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  movimientoInfo: {
    flex: 1,
  },
  categoriaTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fechaTexto: {
    fontSize: 14,
    color: '#666',
  },
  montoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ingreso: {
    color: '#34C759',
  },
  gasto: {
    color: '#FF3B30',
  },
  sinMovimientos: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});