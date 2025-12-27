import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LocalMacrosDB extends DBSchema {
    logs: {
        key: string;
        value: {
            id: string;
            foodName: string;
            calories: number;
            protein: number;
            fat: number;
            carbs: number;
            portion: string;
            date: Date;
            synced: boolean;
            imageData?: string;
        };
        indexes: { 'by-date': Date };
    };
}

const DB_NAME = 'local-macros-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LocalMacrosDB>>;

export function initDB() {
    if (!dbPromise) {
        dbPromise = openDB<LocalMacrosDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore('logs', { keyPath: 'id' });
                store.createIndex('by-date', 'date');
            },
        });
    }
    return dbPromise;
}

export async function saveLog(log: Omit<LocalMacrosDB['logs']['value'], 'synced'>) {
    const db = await initDB();
    await db.put('logs', { ...log, synced: false });
}

export async function getUnsyncedLogs() {
    const db = await initDB();
    const allLogs = await db.getAll('logs');
    return allLogs.filter(log => !log.synced);
}

export async function markAsSynced(id: string) {
    const db = await initDB();
    const log = await db.get('logs', id);
    if (log) {
        log.synced = true;
        await db.put('logs', log);
    }
}

export async function getAllLogs() {
    const db = await initDB();
    return db.getAllFromIndex('logs', 'by-date');
}
