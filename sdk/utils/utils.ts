import { AES, enc } from 'crypto-js';

export type TypedObject<KeyMap, T> = {
  [key in keyof KeyMap]: T;
};

/**
 * Encrypts a given value using AES encryption.
 *
 * @param value - The value to encrypt.
 * @param key - The encryption key.
 * @returns The encrypted value.
 */
export function encrypt(value: any, key: string) {
  try {
    return AES.encrypt(JSON.stringify(value), key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error; // Rethrow the error after logging it.
  }
}

/**
 * Decrypts an encrypted value using AES decryption.
 *
 * @param value - The encrypted value.
 * @param key - The decryption key.
 * @returns The decrypted value.
 */
export function decrypt(value: string, key: string) {
  try {
    return JSON.parse(AES.decrypt(value, key).toString(enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error; // Rethrow the error after logging it.
  }
}
/**
 * Generates a random string of a specified length.
 *
 * @param length=36 - The length of the generated string.
 * @returns A randomly generated string.
 */
export function randomLettersNumbers(length?: number) {
  try {
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
  } catch (error) {
    console.error('Random string generation failed:', error);
    throw error; // Rethrow the error after logging it.
  }
}

/**
 * Checks if two objects are deeply equal.
 *
 * @param {any} object1 - The first object to compare.
 * @param {any} object2 - The second object to compare.
 * @returns {boolean} True if the objects are deeply equal, false otherwise.
 */
export const isDeepEqual = (object1, object2) => {
  try {
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
  } catch (error) {
    console.error('Deep equality check failed:', error);
    throw error; // Rethrow the error after logging it.
  }
};

/**
 * Determines if a value is an object.
 *
 * @param object - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export const isObject = (object: any) => {
  try {
    return object != null && typeof object === 'object';
  } catch (error) {
    console.error('isObject check failed:', error);
    throw error;
  }
};

/**
 * Hashes an encoded Uint8Array using SHA-256.
 *
 * @param encoded - The encoded data to hash.
 * @returns The hashed value as a hexadecimal string.
 */
export async function hashEncoded(encoded: Uint8Array) {
  try {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Hashing failed:', error);
    throw error; // Rethrow the error after logging it.
  }
}

/**
 * Encodes a string into a Uint8Array.
 *
 * @param string - The string to encode.
 * @returns The encoded string as a Uint8Array.
 */
export function encodeString(string: string) {
  const encoder = new TextEncoder();
  return encoder.encode(string);
}

export class AtollUtils {
  /**
   * Wraps the encrypt function, providing a consistent interface for encryption across the application.
   *
   * @param...args - Arguments passed to the underlying encrypt function.
   * @returns The result of the encrypt function.
   */
  static encrypt(...args: Parameters<typeof encrypt>) {
    return encrypt(...args);
  }

  /**
   * Wraps the decrypt function, providing a consistent interface for decryption across the application.
   *
   * @param...args - Arguments passed to the underlying decrypt function.
   * @returns The result of the decrypt function.
   */
  static decrypt(...args: Parameters<typeof decrypt>) {
    return decrypt(...args);
  }

  /**
   * Wraps the randomLettersNumbers function, providing a consistent interface for generating random strings across the application.
   *
   * @param...args - Arguments passed to the underlying randomLettersNumbers function.
   * @returns The result of the randomLettersNumbers function.
   */
  static randomLettersNumbers(
    ...args: Parameters<typeof randomLettersNumbers>
  ) {
    return randomLettersNumbers(...args);
  }

  /**
   * Wraps the isDeepEqual function, providing a consistent interface for deep equality checks across the application.
   *
   * @param...args - Arguments passed to the underlying isDeepEqual function.
   * @returns The result of the isDeepEqual function.
   */
  static isDeepEqual(...args: Parameters<typeof isDeepEqual>) {
    return isDeepEqual(...args);
  }

  /**
   * Wraps the isObject function, providing a consistent interface for checking if a value is an object across the application.
   *
   * @param...args - Arguments passed to the underlying isObject function.
   * @returns The result of the isObject function.
   */
  static isObject(...args: Parameters<typeof isObject>) {
    return isObject(...args);
  }

  /**
   * Wraps the hashEncoded function, providing a consistent interface for hashing encoded data across the application.
   *
   * @param...args - Arguments passed to the underlying hashEncoded function.
   * @returns The result of the hashEncoded function.
   */
  static hashEncoded(...args: Parameters<typeof hashEncoded>) {
    return hashEncoded(...args);
  }

  /**
   * Wraps the encodeString function, providing a consistent interface for encoding strings into Uint8Arrays across the application.
   *
   * @param...args - Arguments passed to the underlying encodeString function.
   * @returns The result of the encodeString function.
   */
  static encodeString(...args: Parameters<typeof encodeString>) {
    return encodeString(...args);
  }
}
