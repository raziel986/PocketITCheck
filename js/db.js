/**
 * db.js - PocketITCheck IndexedDB Persistence Layer
 * Handles all asynchronous database operations.
 */

const DB_NAME = 'PocketITCheckDB';
const DB_VERSION = 1;
const STORE_NAME = 'offices';

export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function getAllOffices() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveOffice(office) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(office);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteOffice(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Migrates data from localStorage to IndexedDB if necessary.
 */
export async function migrateFromLocalStorage() {
    const legacyData = localStorage.getItem('pocketITCheckAppV2') || localStorage.getItem('pocketInventoryAppV2');
    if (legacyData) {
        try {
            const offices = JSON.parse(legacyData);
            if (Array.isArray(offices) && offices.length > 0) {
                console.log('Migrating data to IndexedDB...');
                for (const office of offices) {
                    await saveOffice(office);
                }
                // We keep the backup in localStorage for safety during the first run, 
                // but we could rename it or clear it later once verified.
                localStorage.setItem('pocketITCheck_Migrated', 'true');
                console.log('Migration complete.');
            }
        } catch (e) {
            console.error('Error during migration:', e);
        }
    }
}
