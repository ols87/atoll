import { identityTransferDatabase } from './identity.schema';
import {
  randomLettersNumbers,
  encrypt,
  decrypt,
  hashEncoded,
  encodeString,
} from '../utils';
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

/**
 * Adds an identity object to local storage.
 * @param identity The identity object containing seed phrase, public key, and private key.
 */
export function addIdentityToStore(identity: Identity) {
  localStorage.setItem('identity', JSON.stringify(identity));
}

/**
 * Retrieves an identity object from local storage.
 * @returns The identity object stored in local storage.
 */
export function getIdentityFromStore(): Identity {
  return JSON.parse(localStorage.getItem('identity'));
}

/**
 * Generates a new identity based on a seed phrase.
 * If no seed phrase is provided, a default one is used.
 * @param seedPhrase Optional seed phrase. Defaults to a predefined string.
 * @returns A promise that resolves to the generated identity object.
 */
export async function generateIdentity(
  seedPhrase = 'stomach win pupil vanish sound ethics switch tribe rapid vintage soldier balance',
) {
  try {
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
  } catch (error) {
    console.error('Failed to generate identity:', error);
    throw error; // Rethrow or handle as needed
  }
}

/**
 * Exports the identity database to local storage with encryption.
 * @param encryptionPassword The password used for encrypting the identity seed phrase.
 * @returns A promise that resolves to the export key string.
 */
export async function exportIdentityDatabase(encryptionPassword: string) {
  try {
    const identity = getIdentityFromStore();

    const [password, name, collection, key, id] = Array(5)
      .fill(null)
      .map((value, index) => {
        return randomLettersNumbers(Math.round(12 / (index + 1)));
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

    localStorage.setItem('exportKey', exportKey);

    return exportKey;
  } catch (error) {
    console.error('Failed to export identity database:', error);
    throw error; // Rethrow or handle as needed
  }
}

/**
 * Imports an identity database from local storage using encryption.
 * @param encryptionPassword The password used for decrypting the identity seed phrase.
 * @returns A promise that resolves to the imported identity object.
 */
export async function importIdentityDatabase(encryptionPassword: string) {
  try {
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
  } catch (error) {
    console.error('Failed to import identity database:', error);
    throw error; // Rethrow or handle as needed
  }
}

/**
 * Verifies a digital signature against a public key and data.
 * @param args An object containing the public key, signature, and data to verify.
 * @returns A boolean indicating whether the signature is valid.
 */
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

/**
 * Signs data with a private key.
 * @param privateKey The private key used for signing.
 * @param data The data to be signed.
 * @returns A promise that resolves to the signature.
 */
export async function signData(privateKey: string, data: unknown) {
  const key = ec.keyFromPrivate(privateKey);

  const encoded = encodeString(JSON.stringify(data));
  const hash = await hashEncoded(encoded);

  const signature = key.sign(hash);

  return signature;
}

/**
 * Represents an identity management class with utility methods.
 */
export class AtollIdentity {
  /**
   * Transfers the identity database using the specified arguments.
   * @see {@link identityTransferDatabase} for more details.
   * @param...args Arguments passed to the underlying identityTransferDatabase function.
   * @returns The result of the identityTransferDatabase function.
   */
  static transferDatabase(
    ...args: Parameters<typeof identityTransferDatabase>
  ) {
    return identityTransferDatabase(...args);
  }

  /**
   * Generates a new identity using the specified arguments.
   * @see {@link generateIdentity} for more details.
   * @param...args Arguments passed to the generateIdentity function.
   * @returns A promise that resolves to the generated identity object.
   */
  static generate(...args: Parameters<typeof generateIdentity>) {
    return generateIdentity(...args);
  }

  /**
   * Exports the identity database using the specified arguments.
   * @see {@link exportIdentityDatabase} for more details.
   * @param...args Arguments passed to the exportIdentityDatabase function.
   * @returns A promise that resolves to the export key string.
   */
  static exportDatabase(...args: Parameters<typeof exportIdentityDatabase>) {
    return exportIdentityDatabase(...args);
  }

  /**
   * Imports the identity database using the specified arguments.
   * @see {@link importIdentityDatabase} for more details.
   * @param...args Arguments passed to the importIdentityDatabase function.
   * @returns A promise that resolves to the imported identity object.
   */
  static importDatabase(...args: Parameters<typeof importIdentityDatabase>) {
    return importIdentityDatabase(...args);
  }

  /**
   * Verifies a digital signature using the specified arguments.
   * @see {@link verifySignature} for more details.
   * @param...args Arguments passed to the verifySignature function.
   * @returns A boolean indicating whether the signature is valid.
   */
  static verifySignature(...args: Parameters<typeof verifySignature>) {
    return verifySignature(...args);
  }

  /**
   * Signs data using the specified arguments.
   * @see {@link signData} for more details.
   * @param...args Arguments passed to the signData function.
   * @returns A promise that resolves to the signature.
   */
  static signData(...args: Parameters<typeof signData>) {
    return signData(...args);
  }

  /**
   * Retrieves the current identity from local storage.
   * @see {@link getIdentityFromStore} for more details.
   * @returns The identity object stored in local storage.
   */
  static getStore() {
    return getIdentityFromStore();
  }

  /**
   * Adds an identity to local storage.
   * @see {@link addIdentityToStore} for more details.
   * @param...args Arguments passed to the addIdentityToStore function.
   */
  static addStore(...args: Parameters<typeof addIdentityToStore>) {
    return addIdentityToStore(...args);
  }
}
