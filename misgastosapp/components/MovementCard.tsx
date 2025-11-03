import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Movimiento,
  eliminarMovimiento,
  actualizarMovimiento,
  obtenerCategorias,
  Categoria,
} from '../database/database';

interface MovementCardProps {
  movimiento: Movimiento;
  onMovimientoActualizado: () => void;
}

export default function MovementCard({ movimiento, onMovimientoActualizado }: MovementCardProps) {
  const [modalEditar, setModalEditar] = useState<boolean>(false);
  const [monto, setMonto] = useState<string>(movimiento.monto.toString());
  const [fecha, setFecha] = useState<Date>(new Date(movimiento.fecha));
  const [mostrarCalendario, setMostrarCalendario] = useState<boolean>(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mostrarModalCategorias, setMostrarModalCategorias] = useState<boolean>(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    const cats = await obtenerCategorias(movimiento.tipo);
    setCategorias(cats);
    
    const catActual = cats.find(c => c.id === movimiento.categoria_id);
    if (catActual) {
      setCategoriaSeleccionada(catActual);
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro que desea eliminar este movimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarMovimiento(movimiento.id);
              Alert.alert('Éxito', 'Movimiento eliminado');
              onMovimientoActualizado();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el movimiento');
            }
          },
        },
      ]
    );
  };

  const handleEditar = () => {
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    const montoNumero = parseFloat(monto);

    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'Seleccione una categoría');
      return;
    }

    if (isNaN(montoNumero) || montoNumero <= 0) {
      Alert.alert('Error', 'Ingrese un monto válido');
      return;
    }

    try {
      await actualizarMovimiento(
        movimiento.id,
        categoriaSeleccionada.id,
        montoNumero,
        movimiento.tipo,
        fecha.toISOString()
      );

      Alert.alert('Éxito', 'Movimiento actualizado');
      setModalEditar(false);
      onMovimientoActualizado();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el movimiento');
    }
  };

  const handleCambioFecha = (event: any, selectedDate?: Date) => {
    setMostrarCalendario(Platform.OS === 'ios');
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const handleSeleccionarCategoria = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarModalCategorias(false);
  };

  const formatearMonto = (valor: number): string => {
    return `$${valor.toFixed(2)}`;
  };

  const formatearFecha = (fechaStr: string): string => {
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearFechaEdicion = (): string => {
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.infoContainer}>
            <Text style={styles.categoria}>{movimiento.categoria_nombre}</Text>
            <Text style={styles.fecha}>{formatearFecha(movimiento.fecha)}</Text>
          </View>
          <Text
            style={[
              styles.monto,
              movimiento.tipo === 'ingreso' ? styles.ingreso : styles.gasto,
            ]}
          >
            {movimiento.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(movimiento.monto)}
          </Text>
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity style={styles.botonEditar} onPress={handleEditar}>
            <Text style={styles.botonTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonEliminar} onPress={handleEliminar}>
            <Text style={styles.botonTexto}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Edición */}
      <Modal
        visible={modalEditar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalEditar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar Movimiento</Text>

            <ScrollView>
              <Text style={styles.label}>Categoría</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setMostrarModalCategorias(true)}
              >
                <Text style={styles.inputTexto}>
                  {categoriaSeleccionada ? categoriaSeleccionada.nombre : 'Seleccionar'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Monto</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={monto}
                onChangeText={setMonto}
              />

              <Text style={styles.label}>Fecha</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setMostrarCalendario(true)}
              >
                <Text style={styles.inputTexto}>{formatearFechaEdicion()}</Text>
              </TouchableOpacity>

              {mostrarCalendario && (
                <DateTimePicker
                  value={fecha}
                  mode="date"
                  display="default"
                  onChange={handleCambioFecha}
                />
              )}
            </ScrollView>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalEditar(false)}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardarEdicion}>
                <Text style={styles.botonGuardarTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Categorías */}
      <Modal
        visible={mostrarModalCategorias}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarModalCategorias(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Seleccionar Categoría</Text>
            <ScrollView>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoriaItem}
                  onPress={() => handleSeleccionarCategoria(cat)}
                >
                  <Text style={styles.categoriaItemTexto}>{cat.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => setMostrarModalCategorias(false)}
            >
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContainer: {
    flex: 1,
  },
  categoria: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fecha: {
    fontSize: 14,
    color: '#666',
  },
  monto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ingreso: {
    color: '#34C759',
  },
  gasto: {
    color: '#FF3B30',
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  inputTexto: {
    fontSize: 16,
    color: '#333',
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  categoriaItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriaItemTexto: {
    fontSize: 16,
    color: '#333',
  },
});