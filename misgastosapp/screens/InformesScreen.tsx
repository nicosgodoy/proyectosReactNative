import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';

import { 
  obtenerEstadisticas, 
  obtenerGastosPorCategoriaMensual, 
  obtenerInformeGastosMensual,
  GastoPorCategoria,
  GastoMensual,
} from '../database/database'; 

const generarMeses = (numMeses: number = 6): string[] => {
    const meses: string[] = [];
    let d = new Date();
    for (let i = 0; i < numMeses; i++) {
        const anio = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        meses.push(`${anio}-${mes}`);
        // Retrocede un mes
        d.setMonth(d.getMonth() - 1);
    }
    return meses;
};

const InformesScreen: React.FC = () => {
  const mesesDisponibles = generarMeses(12); // Últimos 12 meses
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(mesesDisponibles[0]);
  
  const [gastosPorCategoria, setGastosPorCategoria] = useState<GastoPorCategoria[]>([]);
  const [informeMensual, setInformeMensual] = useState<GastoMensual[]>([]);
  const [totalGastosMes, setTotalGastosMes] = useState<number>(0);
  const [cargando, setCargando] = useState(true);


  const cargarInformes = useCallback(async () => {
    setCargando(true);
    
  
    const informeTendencia = await obtenerInformeGastosMensual(6);
    setInformeMensual(informeTendencia.reverse()); 

    if (mesSeleccionado) {
      const gastosCat = await obtenerGastosPorCategoriaMensual(mesSeleccionado);
      setGastosPorCategoria(gastosCat);
      const total = gastosCat.reduce((sum, item) => sum + item.totalGastado, 0);
      setTotalGastosMes(total);
    }
    
    setCargando(false);
  }, [mesSeleccionado]);

  useEffect(() => {
    cargarInformes();
  }, [cargarInformes]);



  const renderInformeCategorias = () => {
    if (gastosPorCategoria.length === 0) {
      return <Text style={styles.noDataText}>No hay gastos registrados para {mesSeleccionado}.</Text>;
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Total Gastado en el mes: **${totalGastosMes.toFixed(2)}**</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>Categoría</Text>
            <Text style={styles.headerText}>Monto</Text>
            <Text style={styles.headerText}>%</Text>
          </View>
          {gastosPorCategoria.map((item, index) => {
            const porcentaje = totalGastosMes > 0 ? (item.totalGastado / totalGastosMes) * 100 : 0;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cell}>{item.categoria_nombre}</Text>
                <Text style={styles.cellMonto}>${item.totalGastado.toFixed(2)}</Text>
                <Text style={styles.cellPercent}>{porcentaje.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  const renderTendenciaMensual = () => {
      if (informeMensual.length === 0) {
        return <Text style={styles.noDataText}>No hay datos históricos.</Text>;
      }

      return (
        <View style={styles.table}>
            {informeMensual.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                    <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>{item.periodo}</Text>
                    <Text style={[styles.cellMonto, { flex: 3 }]}>Gastos: ${item.total.toFixed(2)}</Text>
                </View>
            ))}
        </View>
      );
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Informes y Estadísticas</Text>
      
      {cargando ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gasto Mensual por Categoría</Text>
            
            <ScrollView horizontal style={styles.monthSelectorContainer}>
                {mesesDisponibles.map(mes => (
                    <TouchableOpacity
                        key={mes}
                        style={[
                            styles.monthButton,
                            mes === mesSeleccionado && styles.monthButtonSelected
                        ]}
                        onPress={() => setMesSeleccionado(mes)}
                    >
                        <Text style={mes === mesSeleccionado ? styles.monthTextSelected : styles.monthText}>
                            {mes}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {renderInformeCategorias()}
          </View>
          
          <View style={styles.separator} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tendencia de Gastos (Últimos 6 meses)</Text>
            {renderTendenciaMensual()}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f4f7',
  },
  loading: {
      marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF', 
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  // Selector de Mes
  monthSelectorContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  monthButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  monthText: {
    color: '#333',
    fontWeight: '500',
  },
  monthTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Tabla
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 5,
      marginBottom: 10,
      color: '#333',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  cell: {
    flex: 1.5,
    textAlign: 'left',
    paddingLeft: 10,
    color: '#333',
  },
  cellMonto: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: '500',
    color: '#C6302C', 
  },
  cellPercent: {
    flex: 0.5,
    textAlign: 'center',
    fontWeight: '500',
    color: '#555',
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    padding: 10,
  }
});

export default InformesScreen;