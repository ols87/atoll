import { AES, enc } from 'crypto-js';
import { ec as EC } from 'elliptic';

export function encrypt(value: any, key: string) {
  return AES.encrypt(JSON.stringify(value), key).toString();
}

export function decrypt(value: string, key: string) {
  return JSON.parse(AES.decrypt(value, key).toString(enc.Utf8));
}

export function rand(length?: number) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const lettersLength = letters.length;
  const numbersLength = numbers.length;

  let lettersCount = Math.ceil((length || 36) / 2);
  const numbersCount = Math.floor((length || 36) / 2);

  let result = letters.charAt(Math.floor(Math.random() * lettersLength));
  lettersCount--;

  for (let i = 0; i < lettersCount; i++) {
    result += letters.charAt(Math.floor(Math.random() * lettersLength));
  }

  for (let i = 0; i < numbersCount; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbersLength));
  }

  // Shuffle the result
  result = result
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');

  // Ensure the first character is a letter
  while (numbers.includes(result[0])) {
    result = result.slice(1) + result[0];
  }

  return result;
}

export function initEC() {
  return new EC('secp256k1');
}

export function verifySignature(args: {
  publicKey: string;
  signature: string;
  data: string;
}) {
  const { publicKey, signature, data } = args;
  return initEC().keyFromPublic(publicKey, 'hex').verify(data, signature);
}

export async function signData(privateKey: string, data: string) {
  const hashBuffer = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data),
  );
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return initEC().keyFromPrivate(privateKey).sign(hash);
}
