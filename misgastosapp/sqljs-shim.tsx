// Archivo para reemplazar el módulo 'sql.js' en React Native (Android/iOS)
// Esto evita que Metro/Hermes intenten resolver 'fs', el cual no existe en ese entorno.

export default function initSqlJs() {
    console.warn("SQL.js NO debe ser llamado en plataformas nativas.");
    return Promise.reject(new Error("SQL.js no es compatible con plataformas nativas."));
}

// Provee un objeto vacío para simular las otras exportaciones
export const Database = null;
export const Statement = null;