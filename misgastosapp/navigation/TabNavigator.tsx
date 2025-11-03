// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';
// import HomeScreen from '../screens/HomeScreen';
// import AgregarMovimientoScreen from '../screens/AgregarMovimiento';
// import MovimientosScreen from '../screens/MovimientosScreen';

// export type TabParamList = {
//   Inicio: undefined;
//   Agregar: undefined;
//   Movimientos: undefined;
// };

// const Tab = createBottomTabNavigator<TabParamList>();

// export default function TabNavigator() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName: keyof typeof Ionicons.glyphMap;

//           if (route.name === 'Inicio') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'Agregar') {
//             iconName = focused ? 'add-circle' : 'add-circle-outline';
//           } else {
//             iconName = focused ? 'list' : 'list-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#007AFF',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: true,
//       })}
//     >
//       <Tab.Screen 
//         name="Inicio" 
//         component={HomeScreen}
//         options={{ title: 'Inicio' }}
//       />
//       <Tab.Screen 
//         name="Agregar" 
//         component={AgregarMovimientoScreen}
//         options={{ title: 'Agregar Movimiento' }}
//       />
//       <Tab.Screen 
//         name="Movimientos" 
//         component={MovimientosScreen}
//         options={{ title: 'Todos los Movimientos' }}
//       />
//     </Tab.Navigator>
//   );
// }

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importa las pantallas existentes
import HomeScreen from '../screens/HomeScreen';
import AgregarMovimientoScreen from '../screens/AgregarMovimiento';
import MovimientosScreen from '../screens/MovimientosScreen';

// ⭐️ IMPORTAR LA NUEVA PANTALLA DE INFORMES ⭐️
import InformesScreen from '../screens/InformesScreen'; // Asume que el archivo está en '../screens/InformesScreen'

export type TabParamList = {
  Inicio: undefined;
  Agregar: undefined;
  Movimientos: undefined;
  // ⭐️ AÑADIR NUEVA RUTA ⭐️
  Informes: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Agregar') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Movimientos') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            // ⭐️ ICONO PARA INFORMES ⭐️
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="Agregar"
        component={AgregarMovimientoScreen}
        options={{ title: 'Agregar Movimiento' }}
      />
      <Tab.Screen
        name="Movimientos"
        component={MovimientosScreen}
        options={{ title: 'Todos los Movimientos' }}
      />
      {/* ⭐️ NUEVA PESTAÑA DE INFORMES ⭐️ */}
      <Tab.Screen
        name="Informes"
        component={InformesScreen}
        options={{ title: 'Informes' }}
      />
    </Tab.Navigator>
  );
}