import { AES, enc } from 'crypto-js';

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

export const isDeepEqual = (object1, object2) => {
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (const key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if (
      (isObjects && !isDeepEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false;
    }
  }
  return true;
};

const isObject = (object) => {
  return object != null && typeof object === 'object';
};

export class AtollUtils {
  static encrypt(...args: Parameters<typeof encrypt>) {
    return encrypt(...args);
  }

  static decrypt(...args: Parameters<typeof decrypt>) {
    return decrypt(...args);
  }

  static rand(...args: Parameters<typeof rand>) {
    return rand(...args);
  }

  static isDeepEqual(...args: Parameters<typeof isDeepEqual>) {
    return isDeepEqual(...args);
  }
}
