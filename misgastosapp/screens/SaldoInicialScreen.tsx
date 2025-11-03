import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { guardarSaldoInicial } from '../database/database';

interface SaldoInicialScreenProps {
  onSaldoGuardado: () => void;
}

export default function SaldoInicialScreen({ onSaldoGuardado }: SaldoInicialScreenProps) {
  const [saldo, setSaldo] = useState<string>('');

  const handleGuardar = async () => {
    const saldoNumero = parseFloat(saldo);

    if (isNaN(saldoNumero)) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return;
    }

    try {
      await guardarSaldoInicial(saldoNumero);
      Alert.alert('Éxito', 'Saldo inicial guardado correctamente');
      onSaldoGuardado();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el saldo inicial');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.titulo}>Bienvenido</Text>
        <Text style={styles.subtitulo}>Ingrese su saldo inicial</Text>

        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={saldo}
          onChangeText={setSaldo}
        />

        <TouchableOpacity style={styles.boton} onPress={handleGuardar}>
          <Text style={styles.botonTexto}>Guardar Saldo</Text>
        </TouchableOpacity>

        <Text style={styles.nota}>
          Este saldo solo se configura una vez
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  boton: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nota: {
    marginTop: 20,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});