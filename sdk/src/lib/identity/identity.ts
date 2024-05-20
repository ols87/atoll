import { Identities } from '@orbitdb/core';
import { identityTransferDatabase } from './identity.schema';
import {
  getIdentityKeysFromStore,
  writeIdentityKeysToStore,
} from './identity.keystore';
import { rand, encrypt, decrypt } from '../utils';

export async function generateIdentity(id?: string) {
  id = id || Date.now().toString();

  const identities = await Identities();
  const identity = await identities.createIdentity({ id });

  console.log(identity);

  localStorage.setItem('identity', JSON.stringify(identity));

  return identity;
}

export async function exportIdentity() {
  const identity = JSON.parse(localStorage.getItem('identity'));
  const keys = await getIdentityKeysFromStore();

  const name = rand();
  const password = rand();
  const collection = rand();
  const key = rand();
  const id = rand();

  const collections = await identityTransferDatabase({
    name,
    password,
    collection,
    key,
    id,
  });

  await collections[collection].insert({
    id: key,
    [key]: encrypt(keys, 'foo'),
    [id]: encrypt(identity, 'foo'),
  });

  const exportKey = `${name}::${password}::${collection}::${key}::${id}`;

  localStorage.setItem('exportKey', exportKey);

  console.log(exportKey);

  return exportKey;
}

export async function decryptIdentity() {
  const exportKey = localStorage.getItem('exportKey');

  const [name, password, collection, key, id] = exportKey.split('::');

  const collections = await identityTransferDatabase({
    name,
    password,
    collection,
    key,
    id,
  });

  const keyEntry = await collections[collection].findOne(key).exec();

  const decryptedKeys = decrypt(keyEntry[key], 'foo');

  const decryptedIdentity = decrypt(keyEntry[id], 'foo');

  localStorage.setItem('identity', JSON.stringify(decryptedIdentity));

  await writeIdentityKeysToStore(new ArrayBuffer(74), decryptedKeys[0]);
  await writeIdentityKeysToStore(new ArrayBuffer(21), decryptedKeys[1]);

  return decryptedIdentity;
}
