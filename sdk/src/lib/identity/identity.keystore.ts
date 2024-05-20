export async function getIdentityKeysFromStore() {
  const openRequest = indexedDB.open('level-js-orbitdb/identities');

  return new Promise((resolve, reject) => {
    openRequest.onsuccess = (database) => {
      const db = (database.target as IDBOpenDBRequest)?.result;

      if (!db) return reject('Database not found');

      const transaction = db.transaction('orbitdb/identities', 'readonly');
      const store = transaction.objectStore('orbitdb/identities');

      const request = store.getAll();

      request.onsuccess = (keys: Event) =>
        resolve((keys.target as IDBRequest).result);

      request.onerror = (error: Event) => reject(error);
    };

    openRequest.onerror = (error) => reject(error);
  });
}

export async function writeIdentityKeysToStore(
  key: ArrayBuffer,
  value: { [key: number]: number },
) {
  const values = Object.values(value);
  const uint8 = new Uint8Array(values);

  const openRequest = indexedDB.open('level-js-orbitdb/identities');

  return new Promise((resolve, reject) => {
    openRequest.onupgradeneeded = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('orbitdb/identities');
    };

    openRequest.onsuccess = (database) => {
      const db = (database.target as IDBOpenDBRequest)?.result;

      if (!db) return reject('Database not found');

      const transaction = db.transaction('orbitdb/identities', 'readwrite');
      const store = transaction.objectStore('orbitdb/identities');

      const request = store.put(uint8, key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (error: Event) => reject(error);
    };

    openRequest.onerror = (error) => reject(error);
  });
}
