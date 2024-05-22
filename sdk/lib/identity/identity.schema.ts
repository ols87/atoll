import { createRxDatabase } from 'rxdb';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

export async function identityTransferDatabase(args: {
  name: string;
  password: string;
  collection: string;
  key: string;
  id: string;
}) {
  const { name, password, collection, key, id } = args;

  const encryptedDexieStorage = wrappedKeyEncryptionCryptoJsStorage({
    storage: getRxStorageDexie(),
  });

  const db = await createRxDatabase({
    name,
    password,
    storage: encryptedDexieStorage,
    multiInstance: false,
  });

  const propType = {
    type: 'string',
  };

  const collections = await db.addCollections({
    [collection]: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          [key]: propType,
          [id]: propType,
        },
        encrypted: [key, id],
      },
    },
  });

  return collections;
}
