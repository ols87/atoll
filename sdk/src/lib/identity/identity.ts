import { identityTransferDatabase } from './identity.schema';
import { rand, encrypt, decrypt } from '../utils';

const crypto = window.crypto.subtle;

export async function generateIdentity(id?: string) {
  const identity = await crypto.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-384',
    },
    true,
    ['sign', 'verify'],
  );

  const privateKey = await crypto.exportKey('jwk', identity.privateKey);
  const publicKey = await crypto.exportKey('jwk', identity.publicKey);

  const formattedPublicKey = `${publicKey.x}${publicKey.y}`;
  const formattedPrivateKey = `${privateKey.d}`;

  console.log(privateKey);
  console.log(publicKey);

  localStorage.setItem(
    'identity',
    JSON.stringify({
      publicKey: formattedPublicKey,
      privateKey: formattedPrivateKey,
    }),
  );

  return identity;
}

export async function exportIdentity() {
  const identity = JSON.parse(localStorage.getItem('identity'));
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
    [id]: encrypt({ publicKey, privateKey }, 'foo'),
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

  const decryptedIdentity = decrypt(keyEntry[id], 'foo');

  localStorage.setItem('identity', JSON.stringify(decryptedIdentity));

  const x = decryptedIdentity.publicKey.slice(0, 64);
  const y = decryptedIdentity.publicKey.slice(64);

  const publicKey = await crypto.importKey(
    'jwk',
    {
      x,
      y,
      kty: 'EC',
      crv: 'P-384',
      ext: true,
      key_ops: ['verify'],
    },
    {
      name: 'ECDSA',
      namedCurve: 'P-384',
    },
    true,
    ['verify'],
  );

  const privatekey = await crypto.importKey(
    'jwk',
    {
      d: decryptedIdentity.privateKey,
      x,
      y,
      kty: 'EC',
      crv: 'P-384',
      ext: true,
      key_ops: ['sign'],
    },
    {
      name: 'ECDSA',
      namedCurve: 'P-384',
    },
    true,
    ['sign'],
  );

  console.log(publicKey, privatekey);

  return decryptedIdentity;
}
