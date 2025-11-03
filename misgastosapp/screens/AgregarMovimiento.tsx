import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { obtenerCategorias, agregarMovimiento, Categoria } from '../database/database';

export default function AgregarMovimientoScreen() {
  const [monto, setMonto] = useState<string>('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'ingreso' | 'gasto' | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState<boolean>(false);
  const [mostrarModalCategorias, setMostrarModalCategorias] = useState<boolean>(false);

  useEffect(() => {
    cargarCategorias();
  }, [tipoSeleccionado]);

  const cargarCategorias = async () => {
    if (tipoSeleccionado) {
      const cats = await obtenerCategorias(tipoSeleccionado);
      setCategorias(cats);
    }
  };

  const handleSeleccionarTipo = (tipo: 'ingreso' | 'gasto') => {
    setTipoSeleccionado(tipo);
    setCategoriaSeleccionada(null);
  };

  const handleSeleccionarCategoria = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarModalCategorias(false);
  };

  const handleCambioFecha = (event: any, selectedDate?: Date) => {
    setMostrarCalendario(Platform.OS === 'ios');
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const handleGuardar = async () => {
    const montoNumero = parseFloat(monto);

    if (!tipoSeleccionado) {
      Alert.alert('Error', 'Seleccione si es un ingreso o gasto');
      return;
    }

    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'Seleccione una categoría');
      return;
    }

    if (isNaN(montoNumero) || montoNumero <= 0) {
      Alert.alert('Error', 'Ingrese un monto válido');
      return;
    }

    try {
      await agregarMovimiento(
        categoriaSeleccionada.id,
        montoNumero,
        tipoSeleccionado,
        fecha.toISOString()
      );

      Alert.alert('Éxito', 'Movimiento guardado correctamente');
      
      // Resetear formulario
      setMonto('');
      setTipoSeleccionado(null);
      setCategoriaSeleccionada(null);
      setFecha(new Date());
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el movimiento');
      console.error(error);
    }
  };

  const formatearFecha = (): string => {
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Tipo de Movimiento</Text>
        <View style={styles.tipoContainer}>
          <TouchableOpacity
            style={[
              styles.tipoBoton,
              tipoSeleccionado === 'ingreso' && styles.tipoBotonActivo,
              { backgroundColor: tipoSeleccionado === 'ingreso' ? '#34C759' : '#e0e0e0' }
            ]}
            onPress={() => handleSeleccionarTipo('ingreso')}
          >
            <Text style={[
              styles.tipoTexto,
              tipoSeleccionado === 'ingreso' && styles.tipoTextoActivo
            ]}>
              Ingreso
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tipoBoton,
              tipoSeleccionado === 'gasto' && styles.tipoBotonActivo,
              { backgroundColor: tipoSeleccionado === 'gasto' ? '#FF3B30' : '#e0e0e0' }
            ]}
            onPress={() => handleSeleccionarTipo('gasto')}
          >
            <Text style={[
              styles.tipoTexto,
              tipoSeleccionado === 'gasto' && styles.tipoTextoActivo
            ]}>
              Gasto
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => tipoSeleccionado && setMostrarModalCategorias(true)}
          disabled={!tipoSeleccionado}
        >
          <Text style={categoriaSeleccionada ? styles.inputTexto : styles.placeholder}>
            {categoriaSeleccionada ? categoriaSeleccionada.nombre : 'Seleccionar categoría'}
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

        {/* Fecha */}
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setMostrarCalendario(true)}
        >
          <Text style={styles.inputTexto}>{formatearFecha()}</Text>
        </TouchableOpacity>

        {mostrarCalendario && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={handleCambioFecha}
          />
        )}
        <TouchableOpacity
          style={[styles.botonGuardar, !tipoSeleccionado && styles.botonDeshabilitado]}
          onPress={handleGuardar}
          disabled={!tipoSeleccionado}
        >
          <Text style={styles.botonGuardarTexto}>Guardar Movimiento</Text>
        </TouchableOpacity>
      </View>
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
              style={styles.modalBotonCerrar}
              onPress={() => setMostrarModalCategorias(false)}
            >
              <Text style={styles.modalBotonCerrarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  tipoBoton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  tipoBotonActivo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tipoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  tipoTextoActivo: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  inputTexto: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
  botonGuardar: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  botonGuardarTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
  modalBotonCerrar: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalBotonCerrarTexto: {
    fontSize: 16,
    color: '#666',
  },
});