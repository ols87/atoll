import { identityTransferDatabase } from './identity.schema';
import { rand, encrypt, decrypt } from '../utils';
import { ec as EC } from 'elliptic';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import { initProfileDatabase, updateProfile } from '../profile';

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
  seedPhrase = bip39.generateMnemonic(),
) {
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const ec = new EC('secp256k1');
  const keyPair = ec.keyFromPrivate(seed);

  const publicKey = keyPair.getPublic('hex');
  const privateKey = keyPair.getPrivate('hex');

  console.log('Public Key:', publicKey);
  console.log('Private Key:', privateKey);

  const identity = {
    seedPhrase,
    privateKey,
    publicKey,
  };

  addIdentityToStore(identity);

  await initProfileDatabase(identity);

  await updateProfile(identity, 'Atoll User');

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

  console.log(exportKey);

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
