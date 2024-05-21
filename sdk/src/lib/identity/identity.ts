import { identityTransferDatabase } from './identity.schema';
import { rand, encrypt, decrypt } from '../utils';

const crypto = window.crypto.subtle;

const keyPairFormat = {
  name: 'ECDSA',
  namedCurve: 'P-384',
};

export function addIdentityToStore(identity: any) {
  localStorage.setItem('identity', JSON.stringify(identity));
}

export function getIdentityFromStore() {
  return JSON.parse(localStorage.getItem('identity'));
}

export async function generateIdentity() {
  const keys = await crypto.generateKey(keyPairFormat, true, [
    'sign',
    'verify',
  ]);

  const privateKey = await crypto.exportKey('jwk', keys.privateKey);
  const publicKey = await crypto.exportKey('jwk', keys.publicKey);

  const formattedPublicKey = `${publicKey.x}${publicKey.y}`;
  const formattedPrivateKey = `${privateKey.d}`;

  addIdentityToStore({
    publicKey: formattedPublicKey,
    privateKey: formattedPrivateKey,
  });

  return keys;
}

export async function exportIdentityString(encryptionPassword: string) {
  const identity = getIdentityFromStore();
  const { publicKey, privateKey } = identity;
  const encryptedIdentity = encrypt(
    { publicKey, privateKey },
    encryptionPassword,
  );

  console.log(encryptedIdentity);

  return encryptedIdentity;
}

export async function importIdentityString(
  encryptedIdentity: string,
  encryptionPassword: string,
) {
  const identity = decrypt(encryptedIdentity, encryptionPassword);

  addIdentityToStore(identity);

  return await importIdentityKeys(identity);
}

export async function exportIdentityDatabase(encryptionPassword: string) {
  const identity = getIdentityFromStore();
  const { publicKey, privateKey } = identity;

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
    [id]: encrypt({ publicKey, privateKey }, encryptionPassword),
  });

  const exportKey = `${name}::${password}::${collection}::${key}::${id}`;

  // Remove This
  localStorage.setItem('exportKey', exportKey);

  console.log(exportKey);

  return exportKey;
}

export async function importIdentityDatabase(encryptionPassword: string) {
  // Remove This
  const exportKey = localStorage.getItem('exportKey');

  const [name, password, collection, key, id] = exportKey.split('::');

  const collections = await identityTransferDatabase({
    name,
    password,
    collection,
    key,
    id,
  });

  const identityEntry = await collections[collection].findOne(key).exec();

  const identity = decrypt(identityEntry[id], encryptionPassword);

  addIdentityToStore(identity);

  return await importIdentityKeys(identity);
}

async function importIdentityKeys(identity: any) {
  const keyJWK = {
    kty: 'EC',
    crv: 'P-384',
    ext: true,
    x: identity.publicKey.slice(0, 64),
    y: identity.publicKey.slice(64),
  };

  const publicKey = await crypto.importKey(
    'jwk',
    {
      ...keyJWK,
      key_ops: ['verify'],
    },
    keyPairFormat,
    true,
    ['verify'],
  );

  const privateKey = await crypto.importKey(
    'jwk',
    {
      ...keyJWK,
      d: identity.privateKey,
      key_ops: ['sign'],
    },
    keyPairFormat,
    true,
    ['sign'],
  );

  console.log(publicKey, privateKey);

  return {
    publicKey,
    privateKey,
  };
}
