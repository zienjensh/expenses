// Offline storage utility using IndexedDB for better performance
const DB_NAME = 'falusy_offline_db';
const DB_VERSION = 1;
const STORE_EXPENSES = 'expenses';
const STORE_REVENUES = 'revenues';
const STORE_PROJECTS = 'projects';

let db = null;

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORE_EXPENSES)) {
        database.createObjectStore(STORE_EXPENSES, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORE_REVENUES)) {
        database.createObjectStore(STORE_REVENUES, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORE_PROJECTS)) {
        database.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
    };
  });
};

// Save data to IndexedDB
export const saveToOfflineStorage = async (storeName, data, userId = null) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // If userId provided, clear only this user's data first
    if (userId) {
      const allData = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      
      // Remove this user's old data
      for (const item of allData) {
        if (item.userId === userId) {
          await store.delete(item.id);
        }
      }
    } else {
      // Clear all data if no userId
      await store.clear();
    }
    
    // Add current data
    if (Array.isArray(data) && data.length > 0) {
      for (const item of data) {
        await store.put(item);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving to offline storage (${storeName}):`, error);
    // Fallback to localStorage if IndexedDB fails
    try {
      const key = userId ? `falusy_${storeName}_${userId}` : `falusy_${storeName}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  }
};

// Load data from IndexedDB
export const loadFromOfflineStorage = async (storeName, userId = null) => {
  try {
    const database = await initDB();
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        let result = request.result || [];
        // Filter by userId if provided
        if (userId) {
          result = result.filter(item => item.userId === userId);
        }
        resolve(result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error loading from offline storage (${storeName}):`, error);
    // Fallback to localStorage
    try {
      const key = userId ? `falusy_${storeName}_${userId}` : `falusy_${storeName}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return [];
    }
  }
};

// Clear all offline storage
export const clearOfflineStorage = async () => {
  try {
    const database = await initDB();
    const stores = [STORE_EXPENSES, STORE_REVENUES, STORE_PROJECTS];
    
    for (const storeName of stores) {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    
    // Also clear localStorage fallback
    stores.forEach(storeName => {
      localStorage.removeItem(`falusy_${storeName}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing offline storage:', error);
    return false;
  }
};

export { STORE_EXPENSES, STORE_REVENUES, STORE_PROJECTS };

