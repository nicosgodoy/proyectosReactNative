import * as SQLite from 'expo-sqlite';


export interface Categoria {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'gasto';
}

export interface Movimiento {
  id: number;
  categoria_id: number;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  fecha: string;
  descripcion?: string;
  categoria_nombre?: string;
}

export interface Configuracion {
  id: number;
  saldo_inicial: number;
  fecha_creacion: string;
}

export interface GastoMensual {
  periodo: string; // Ej: '2025-11'
  total: number;
}

export interface GastoPorCategoria {
  categoria_nombre: string;
  totalGastado: number;
}


// Variable global para mantener la conexión
let db: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Cola de operaciones
let operationQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

// Función para procesar la cola de operaciones
const processQueue = async () => {
  if (isProcessingQueue || operationQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (operationQueue.length > 0) {
    const operation = operationQueue.shift();
    if (operation) {
      try {
        await operation();
      } catch (error) {
        console.error('Error en operación de cola:', error);
      }
    }
  }

  isProcessingQueue = false;
};

// Función para agregar operación a la cola
const queueOperation = <T>(operation: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    operationQueue.push(async () => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
};

// Función para obtener la base de datos
const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = SQLite.openDatabaseAsync('finanzas.db');
  
  try {
    db = await initPromise;
    isInitializing = false;
    return db;
  } catch (error) {
    isInitializing = false;
    initPromise = null;
    throw error;
  }
};

// Inicializar la base de datos
export const initDatabase = async (): Promise<void> => {
  try {
    const database = await getDatabase();

    // Tabla de configuración para saldo inicial
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS configuracion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        saldo_inicial REAL NOT NULL,
        fecha_creacion TEXT NOT NULL
      );
    `);

    // Tabla de categorías
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL
      );
    `);

    // Tabla de movimientos
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER NOT NULL,
        monto REAL NOT NULL,
        tipo TEXT NOT NULL,
        fecha TEXT NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      );
    `);

    // Insertar categorías por defecto si no existen
    const categorias = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM categorias'
    );
    
    if (categorias && categorias.count === 0) {
      // Categorías de Ingreso
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Salario', 'ingreso']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Venta', 'ingreso']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Freelance', 'ingreso']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Inversiones', 'ingreso']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Otros Ingresos', 'ingreso']
      );

      // Categorías de Gasto
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Alimentos', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Transporte', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Entretenimiento', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Servicios', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Salud', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Educación', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Vivienda', 'gasto']
      );
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        ['Otros Gastos', 'gasto']
      );
    }

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Guardar saldo inicial
export const guardarSaldoInicial = async (saldo: number): Promise<void> => {
  return queueOperation(async () => {
    try {
      const database = await getDatabase();
      const fechaActual = new Date().toISOString();
      
      await database.runAsync(
        'INSERT INTO configuracion (saldo_inicial, fecha_creacion) VALUES (?, ?)',
        [saldo, fechaActual]
      );

      console.log('Saldo inicial guardado:', saldo);
    } catch (error) {
      console.error('Error al guardar saldo inicial:', error);
      throw error;
    }
  });
};

// Obtener saldo inicial
export const obtenerSaldoInicial = async (): Promise<number> => {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ saldo_inicial: number }>(
      'SELECT saldo_inicial FROM configuracion WHERE id = 1'
    );
    return result ? result.saldo_inicial : 0;
  } catch (error) {
    console.error('Error al obtener saldo inicial:', error);
    return 0;
  }
};

// Verificar si existe saldo inicial
export const verificarSaldoInicial = async (): Promise<number | null> => {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ saldo_inicial: number }>(
      'SELECT saldo_inicial FROM configuracion WHERE id = 1'
    );
    return result ? result.saldo_inicial : null;
  } catch (error) {
    console.error('Error al verificar saldo inicial:', error);
    return null;
  }
};

// Obtener categorías
export const obtenerCategorias = async (tipo?: 'ingreso' | 'gasto'): Promise<Categoria[]> => {
  try {
    const database = await getDatabase();
    
    if (tipo) {
      return await database.getAllAsync<Categoria>(
        'SELECT * FROM categorias WHERE tipo = ? ORDER BY nombre',
        [tipo]
      );
    }
    
    return await database.getAllAsync<Categoria>('SELECT * FROM categorias ORDER BY nombre');
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

// Agregar un nuevo movimiento
export const agregarMovimiento = async (
  categoriaId: number,
  monto: number,
  tipo: 'ingreso' | 'gasto',
  fecha: string,
  descripcion?: string
): Promise<void> => {
  return queueOperation(async () => {
    try {
      const database = await getDatabase();
      
      await database.runAsync(
        'INSERT INTO movimientos (categoria_id, monto, tipo, fecha, descripcion) VALUES (?, ?, ?, ?, ?)',
        [categoriaId, monto, tipo, fecha, descripcion || '']
      );

      console.log('Movimiento agregado correctamente');
    } catch (error) {
      console.error('Error al agregar movimiento:', error);
      throw error;
    }
  });
};


export const obtenerMovimientos = async (limite?: number): Promise<Movimiento[]> => {
  try {
    const database = await getDatabase();
    
    const query = `
      SELECT 
        m.id,
        m.categoria_id,
        m.monto,
        m.tipo,
        m.fecha,
        m.descripcion,
        c.nombre as categoria_nombre
      FROM movimientos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      ORDER BY m.fecha DESC, m.id DESC
      ${limite ? 'LIMIT ?' : ''}
    `;
    
    if (limite) {
      return await database.getAllAsync<Movimiento>(query, [limite]);
    }
    
    return await database.getAllAsync<Movimiento>(query);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return [];
  }
};

// Obtener un movimiento por ID
export const obtenerMovimientoPorId = async (id: number): Promise<Movimiento | null> => {
  try {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Movimiento>(
      `SELECT 
        m.id,
        m.categoria_id,
        m.monto,
        m.tipo,
        m.fecha,
        m.descripcion,
        c.nombre as categoria_nombre
      FROM movimientos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      WHERE m.id = ?`,
      [id]
    );
    
    return result || null;
  } catch (error) {
    console.error('Error al obtener movimiento por ID:', error);
    return null;
  }
};

// Actualizar un movimiento existente
export const actualizarMovimiento = async (
  id: number,
  categoriaId: number,
  monto: number,
  tipo: 'ingreso' | 'gasto',
  fecha: string,
  descripcion?: string
): Promise<void> => {
  return queueOperation(async () => {
    try {
      const database = await getDatabase();
      
      await database.runAsync(
        'UPDATE movimientos SET categoria_id = ?, monto = ?, tipo = ?, fecha = ?, descripcion = ? WHERE id = ?',
        [categoriaId, monto, tipo, fecha, descripcion || '', id]
      );

      console.log('Movimiento actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar movimiento:', error);
      throw error;
    }
  });
};

// Eliminar un movimiento
export const eliminarMovimiento = async (id: number): Promise<void> => {
  return queueOperation(async () => {
    try {
      const database = await getDatabase();
      
      await database.runAsync('DELETE FROM movimientos WHERE id = ?', [id]);

      console.log('Movimiento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      throw error;
    }
  });
};

// Calcular saldo actual
export const calcularSaldoActual = async (): Promise<number> => {
  try {
    const database = await getDatabase();
    
    const saldoInicial = await obtenerSaldoInicial();
    
    const ingresos = await database.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'ingreso'"
    );
    
    const gastos = await database.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'gasto'"
    );
    
    const totalIngresos = ingresos?.total || 0;
    const totalGastos = gastos?.total || 0;
    
    return saldoInicial + totalIngresos - totalGastos;
  } catch (error) {
    console.error('Error al calcular saldo actual:', error);
    return 0;
  }
};

// Obtener estadísticas
export const obtenerEstadisticas = async (): Promise<{
  totalIngresos: number;
  totalGastos: number;
  saldoInicial: number;
  saldoActual: number;
  cantidadMovimientos: number;
}> => {
  try {
    const database = await getDatabase();
    
    const saldoInicial = await obtenerSaldoInicial();
    
    const ingresos = await database.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'ingreso'"
    );
    
    const gastos = await database.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'gasto'"
    );
    
    const cantidad = await database.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM movimientos"
    );
    
    const totalIngresos = ingresos?.total || 0;
    const totalGastos = gastos?.total || 0;
    const saldoActual = saldoInicial + totalIngresos - totalGastos;
    
    return {
      totalIngresos,
      totalGastos,
      saldoInicial,
      saldoActual,
      cantidadMovimientos: cantidad?.count || 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      totalIngresos: 0,
      totalGastos: 0,
      saldoInicial: 0,
      saldoActual: 0,
      cantidadMovimientos: 0,
    };
  }
};

// Agregar una nueva categoría
export const agregarCategoria = async (
  nombre: string,
  tipo: 'ingreso' | 'gasto'
): Promise<void> => {
  return queueOperation(async () => {
    try {
      const database = await getDatabase();
      
      await database.runAsync(
        'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
        [nombre, tipo]
      );

      console.log('Categoría agregada correctamente');
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      throw error;
    }
  });
};

// Eliminar una categoría (solo si no tiene movimientos asociados)
export const eliminarCategoria = async (id: number): Promise<void> => {
  return queueOperation(async () => {
    try {
      const database = await getDatabase();
      
      // Verificar si tiene movimientos asociados
      const movimientos = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM movimientos WHERE categoria_id = ?',
        [id]
      );
      
      if (movimientos && movimientos.count > 0) {
        throw new Error('No se puede eliminar una categoría con movimientos asociados');
      }
      
      await database.runAsync('DELETE FROM categorias WHERE id = ?', [id]);

      console.log('Categoría eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  });
};
export const obtenerGastosPorRango = async (
  fechaInicio: string,
  fechaFin: string
): Promise<number> => {
  try {
    const database = await getDatabase();

    // Consulta SQL para sumar los montos de tipo 'gasto'
    // que caen entre la fecha de inicio y la fecha de fin (inclusive).
    const result = await database.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(monto) as total 
       FROM movimientos 
       WHERE tipo = 'gasto' 
       AND fecha >= ? 
       AND fecha <= ?`,
      [fechaInicio, fechaFin]
    );

    return result?.total || 0;
  } catch (error) {
    console.error('Error al obtener gastos por rango:', error);
    return 0;
  }
};

export interface GastoSemanal {
  periodo: string; // Ej: '2025-44' (Año-Semana)
  total: number;
}

export const obtenerInformeGastosSemanal = async (limiteSemanas: number = 8): Promise<GastoSemanal[]> => {
  try {
    const database = await getDatabase();

    const query = `
      SELECT 
        strftime('%Y-%W', fecha) as periodo,
        SUM(monto) as total
      FROM movimientos
      WHERE tipo = 'gasto'
      GROUP BY periodo
      ORDER BY periodo DESC
      LIMIT ?;
    `;
    
    return await database.getAllAsync<GastoSemanal>(query, [limiteSemanas]);
  } catch (error) {
    console.error('Error al obtener informe semanal:', error);
    return [];
  }
};

const getMonthStartAndEnd = (anioMes: string): { start: string, end: string } => {
    const [anio, mes] = anioMes.split('-').map(Number);
    
    const dateStart = new Date(anio, mes - 1, 1); 

    const dateEnd = new Date(anio, mes, 0); 

    const formatDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return {
        start: formatDate(dateStart),
        end: formatDate(dateEnd),
    };
};


// --- Funciones de Informe ---

// 1. Informe de Gastos Agrupados por Mes (Tendencia)
export const obtenerInformeGastosMensual = async (limiteMeses: number = 6): Promise<GastoMensual[]> => {
  try {
    const database = await getDatabase();

    const query = `
      SELECT 
        strftime('%Y-%m', fecha) as periodo,
        SUM(monto) as total
      FROM movimientos
      WHERE tipo = 'gasto'
      GROUP BY periodo
      ORDER BY periodo DESC
      LIMIT ?;
    `;
    
    return await database.getAllAsync<GastoMensual>(query, [limiteMeses]);
  } catch (error) {
    console.error('Error al obtener informe mensual:', error);
    return [];
  }
};

export const obtenerGastosPorCategoriaMensual = async (
  anioMes: string 
): Promise<GastoPorCategoria[]> => {
  try {
    const database = await getDatabase();
    
    const { start: fechaInicio, end: fechaFin } = getMonthStartAndEnd(anioMes);

    const query = `
      SELECT 
        c.nombre as categoria_nombre,
        SUM(m.monto) as totalGastado
      FROM movimientos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      WHERE m.tipo = 'gasto'
        AND m.fecha >= ?
        AND m.fecha <= ?
      GROUP BY c.nombre
      ORDER BY totalGastado DESC;
    `;
    
    const params = [fechaInicio, fechaFin];
    
    return await database.getAllAsync<GastoPorCategoria>(query, params);

  } catch (error) {
    console.error('Error al obtener gastos por categoría mensual:', error);
    return [];
  }
};