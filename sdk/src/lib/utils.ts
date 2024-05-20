import { AES, enc } from 'crypto-js';

export function encrypt(value: any, key: string) {
  return AES.encrypt(JSON.stringify(value), key).toString();
}

export function decrypt(value: string, key: string) {
  return JSON.parse(AES.decrypt(value, key).toString(enc.Utf8));
}

export function rand(length?: number) {
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
