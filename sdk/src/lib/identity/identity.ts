import { Identities, KeyStore } from '@orbitdb/core';
import { createRxDatabase } from 'rxdb';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { generateDynamicSchema } from './identity.schema';
import { AES, enc } from 'crypto-js';

export async function generateIdentity(id?: string) {
  id = id || Date.now().toString();

  const identities = await Identities();
  const identity = await identities.createIdentity({ id });

  console.log(identity);

  localStorage.setItem('identity', JSON.stringify(identity));

  return identity;
}

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

function rand(length?: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const otherChars = '0123456789';
  const charactersLength = characters.length;
  const otherCharsLength = length || 36;

  result += characters.charAt(Math.floor(Math.random() * charactersLength));

  for (let i = 1; i < otherCharsLength; i++) {
    result += otherChars.charAt(Math.floor(Math.random() * otherChars.length));
  }

  return result;
}

export async function exportIdentity() {
  const identity = JSON.parse(localStorage.getItem('identity'));
  const keys = await getIdentityKeysFromStore();
  const randomDbName = rand();
  const randomDbPassword = rand();
  const randomCollectionName = rand();
  const randomKeyName = rand();
  const randomIDName = rand();

  const encryptedDexieStorage = wrappedKeyEncryptionCryptoJsStorage({
    storage: getRxStorageDexie(),
  });

  const db = await createRxDatabase({
    name: randomDbName,
    storage: encryptedDexieStorage,
    password: randomDbPassword,
    multiInstance: false,
  });

  const collections = await db.addCollections({
    [randomCollectionName]: {
      schema: generateDynamicSchema({
        properties: {
          [randomKeyName]: {
            type: 'string',
          },
          [randomIDName]: {
            type: 'string',
          },
        },
        encrypted: [randomKeyName, randomIDName],
      }),
    },
  });

  await collections[randomCollectionName].insert({
    id: randomKeyName,
    [randomKeyName]: AES.encrypt(JSON.stringify(keys), 'foo').toString(),
    [randomIDName]: AES.encrypt(JSON.stringify(identity), 'foo').toString(),
  });

  const key = `${randomDbName}:::${randomDbPassword}:::${randomCollectionName}:::${randomKeyName}:::${randomIDName}`;

  localStorage.setItem('key', key);

  console.log(key);

  return key;
}

export async function decryptIdentity() {
  const key = localStorage.getItem('key');

  const [dbName, dbPassword, collectionName, keyName, idName] =
    key.split(':::');

  const encryptedDexieStorage = wrappedKeyEncryptionCryptoJsStorage({
    storage: getRxStorageDexie(),
  });

  const db = await createRxDatabase({
    name: dbName,
    storage: encryptedDexieStorage,
    password: dbPassword,
    multiInstance: false,
  });

  const collections = await db.addCollections({
    [collectionName]: {
      schema: generateDynamicSchema({
        properties: {
          [keyName]: {
            type: 'string',
          },
          [idName]: {
            type: 'string',
          },
        },
        encrypted: [keyName, idName],
      }),
    },
  });

  const keyEntry = await collections[collectionName].findOne(keyName).exec();

  const decryptedKeys = JSON.parse(
    AES.decrypt(keyEntry[keyName], 'foo').toString(enc.Utf8),
  );

  const decryptedID = JSON.parse(
    AES.decrypt(keyEntry[idName], 'foo').toString(enc.Utf8),
  );

  console.log(decryptedID);

  localStorage.setItem('identity', JSON.stringify(decryptedID));

  await writeIdentityKeysToStore(new ArrayBuffer(74), decryptedKeys[0]);
  await writeIdentityKeysToStore(new ArrayBuffer(21), decryptedKeys[1]);
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
