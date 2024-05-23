import { identityTransferDatabase } from './identity.schema';
import { rand, encrypt, decrypt, hashEncoded, encodeString } from '../utils';
import { ec as EC } from 'elliptic';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import { initProfileDatabase, upsertProfile } from '../profile';

const ec = new EC('secp256k1');

(window as any).Buffer = Buffer;

export interface Identity {
  seedPhrase: string;
  publicKey: string;
  privateKey: string;
}

export function addIdentityToStore(identity: Identity) {
  localStorage.setItem('identity', JSON.stringify(identity));
}

export function getIdentityFromStore(): Identity {
  return JSON.parse(localStorage.getItem('identity'));
}

export async function generateIdentity(
  // Remove this default seedPhrase
  seedPhrase = 'stomach win pupil vanish sound ethics switch tribe rapid vintage soldier balance',
) {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const ec = new EC('secp256k1');
  const keyPair = ec.keyFromPrivate(seed);

  const publicKey = keyPair.getPublic('hex');
  const privateKey = keyPair.getPrivate('hex');

  const identity = {
    seedPhrase,
    privateKey,
    publicKey,
  };

  addIdentityToStore(identity);

  await initProfileDatabase(identity.publicKey);

  await upsertProfile(identity, {});

  return identity;
}

export async function exportIdentityDatabase(encryptionPassword: string) {
  const identity = getIdentityFromStore();

  const [password, name, collection, key, id] = Array(5)
    .fill(null)
    .map((value, index) => {
      return rand(Math.round(12 / (index + 1)));
    });

  const collections = await identityTransferDatabase({
    name,
    password,
    collection,
    key,
    id,
  });

  await collections[collection].insert({
    id: key,
    [id]: encrypt(identity.seedPhrase, encryptionPassword),
  });

  const exportKey = `${name}:${password}:${collection}:${key}:${id}`;

  // Remove This
  localStorage.setItem('exportKey', exportKey);

  return exportKey;
}

export async function importIdentityDatabase(encryptionPassword: string) {
  // Remove This
  const exportKey = localStorage.getItem('exportKey');

  const [name, password, collection, key, id] = exportKey.split(':');

  const collections = await identityTransferDatabase({
    name,
    password,
    collection,
    key,
    id,
  });

  const identityEntry = await collections[collection].findOne(key).exec();

  const identity = decrypt(identityEntry[id], encryptionPassword);

  return await generateIdentity(identity.seed);
}

export async function verifySignature(args: {
  publicKey: string;
  signature: EC.Signature;
  data: string;
}) {
  const { publicKey, signature, data } = args;

  const key = ec.keyFromPublic(publicKey, 'hex');

  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return key.verify(hash, signature);
}

export async function signData(privateKey: string, data: unknown) {
  const key = ec.keyFromPrivate(privateKey);

  const encoded = encodeString(JSON.stringify(data));
  const hash = await hashEncoded(encoded);

  const signature = key.sign(hash);

  return signature;
}

export class AtollIdentity {
  static transferDatabase(
    ...args: Parameters<typeof identityTransferDatabase>
  ) {
    return identityTransferDatabase(...args);
  }

  static generate(...args: Parameters<typeof generateIdentity>) {
    return generateIdentity(...args);
  }

  static exportDatabase(...args: Parameters<typeof exportIdentityDatabase>) {
    return exportIdentityDatabase(...args);
  }

  static importDatabase(...args: Parameters<typeof importIdentityDatabase>) {
    return importIdentityDatabase(...args);
  }

  static verifySignature(...args: Parameters<typeof verifySignature>) {
    return verifySignature(...args);
  }

  static signData(...args: Parameters<typeof signData>) {
    return signData(...args);
  }

  static getStore() {
    return getIdentityFromStore();
  }

  static addStore(...args: Parameters<typeof addIdentityToStore>) {
    return addIdentityToStore(...args);
  }
}
