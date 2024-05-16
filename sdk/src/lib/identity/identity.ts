import { Identities } from '@orbitdb/core';
import { createRxDatabase } from 'rxdb';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { generateDynamicSchema } from './identity.schema';
import { AES } from 'crypto-js';

export async function generateIdentity(id?: string) {
  id = id || Date.now().toString();

  const identities = await Identities();
  const identity = await identities.createIdentity({ id });

  console.log(identity);

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
  const keys = await getIdentityKeysFromStore();
  const randomDbName = rand();
  const randomDbPassword = rand();
  const randomCollectionName = rand();
  const randomKeyName = rand();

  const encryptedDexieStorage = wrappedKeyEncryptionCryptoJsStorage({
    storage: getRxStorageDexie(),
  });

  console.log(randomDbName);

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
            type: 'array',
          },
        },
        encrypted: [randomKeyName],
      }),
    },
  });

  console.log(collections[randomCollectionName]);

  await collections[randomCollectionName].insert({
    id: rand(),
    [randomKeyName]: AES.encrypt(JSON.stringify(keys), 'foo').toString(),
  });

  return `${randomDbName}:::${randomDbPassword}:::${randomCollectionName}:::${randomKeyName}`;
}

// export async function getIdentity(id: string) {
//   const document = await db.keys.findOne(id).exec();
// }
