import { Platform } from 'react-native';
import { ScannedCode } from '../src/models';

let SQLite: any;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

export async function connectdb() {
  if (Platform.OS === 'web') {
    console.warn('SQLite no está disponible en la web');
    return {
      insertarCodigo: async () => {},
      consultarCodigos: async () => [],
    };
  }

  const db = await SQLite.openDatabaseAsync('ScanQR');
  return new Database(db);
}

export class Database {
  constructor(private db: any) {
    this.init();
  }
  close () {
    this.db.closeAsync();
  }

  private async init() {
    await this.db.execAsync(
      `CREATE TABLE IF NOT EXISTS codigos (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        data TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'QR'
      );`
    );
  }

  async dropDB() {
    await this.db.execAsync(`DROP TABLE IF EXISTS codigos`);
  }

  async insertarCodigo(data: string, type: string) {
    const result = await this.db.runAsync(
      `INSERT INTO codigos (data, type) VALUES (?, ?)`, // ✅ Query como string
      [data, type] // ✅ Argumentos como arreglo
    );
    return result;
  }

  async consultarCodigos() {
    const result = await this.db.getAllAsync(); // ✅ Query como string
    return result;
  }
}
