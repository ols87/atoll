import {
  ProfileSchema,
  ProfileWriteSchema,
  profileSchema,
} from './profile.schema';
import { Identity, signData } from '../identity';
import {
  RxCollection,
  RxConflictHandlerInput,
  RxDatabase,
  createRxDatabase,
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import {
  verifySignedWrite,
  replicateCollection,
  SignedProp,
  TypedObject,
} from '../utils';

/**
 * A list of profile databases databases. Not normally used
 */
export const profileDatabases: {
  [key: string]: RxDatabase<ProfileSchema>;
} = {};

/**
 * Initializes or retrieves the profile database associated with the given public key.
 *
 * @param publicKey - The public key used to identify the database.
 * @returns A promise that resolves to the collection object for profiles.
 */
export const initProfileDatabase = async (
  publicKey: string,
): Promise<RxCollection> => {
  try {
    const name = `atoll__profile__${publicKey}`;

    if (profileDatabases[name])
      return profileDatabases[name].collections['profile'];

    profileDatabases[name] = await createRxDatabase({
      name,
      storage: getRxStorageDexie(),
    });

    const collections = await profileDatabases[name].addCollections({
      profile: {
        schema: profileSchema,
        conflictHandler: (instance: RxConflictHandlerInput<ProfileSchema>) =>
          Promise.resolve(
            (async () => await verifySignedWrite(publicKey, instance))(),
          ),
      },
    });

    await replicateCollection(
      collections.profile,
      `${name.substring(0, 64)}-profile-pool`,
    );

    return collections.profile;
  } catch (error) {
    console.error('Error initializing profile database:', error);
    throw error; // Rethrow the error after logging it.
  }
};

/**
 * Upserts a profile entry in the database, signing the data with the private key before insertion.
 *
 * @param identity - The identity object containing the public and private keys.
 * @param writeData - The data to be inserted or updated.
 */
export async function upsertProfile(
  identity: Identity,
  writeData: TypedObject<ProfileWriteSchema, string>,
) {
  try {
    const { publicKey, privateKey } = identity;
    const signedData: { [key: string]: SignedProp } = {};

    for (const key of Object.keys(writeData)) {
      if (key === 'id') continue;

      const data = writeData[key];
      const signature = await signData(privateKey, data);

      signedData[key] = {
        data,
        signature,
      };
    }

    const profile = await initProfileDatabase(publicKey);

    profile.upsert({
      ...signedData,
      id: '1',
    });
  } catch (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
}

/**
 * Represents a profile in the Atoll system.
 */
export class AtollProfile {
  /**
   * Static schema definition for profiles.
   */
  static schema = profileSchema;

  /**
   * Static reference to all initialized profile databases.
   */
  static databases = profileDatabases;

  /**
   * Initializes the profile database for a given public key.
   *
   * @param {...Parameters<typeof initProfileDatabase>} args - Arguments passed to initProfileDatabase.
   * @returns {Promise<RxCollection>} A promise that resolves to the collection object for profiles.
   */
  static initDatabase(...args: Parameters<typeof initProfileDatabase>) {
    return initProfileDatabase(...args);
  }

  /**
   * Upserts a profile entry in the database.
   *
   * @param {...Parameters<typeof upsertProfile>} args - Arguments passed to upsertProfile.
   */
  static upsert(...args: Parameters<typeof upsertProfile>) {
    return upsertProfile(...args);
  }
}
