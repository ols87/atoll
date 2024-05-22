import { ProfileSchema, profileSchema } from './profile.schema';
import { Identity, signData } from '../identity';
import {
  RxCollection,
  RxConflictHandlerInput,
  RxDatabase,
  createRxDatabase,
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { verifySignedWrite, replicateCollection } from '../utils/database';

const w = window as any;

w.process = {
  nextTick: (fn: any, ...args: any) => setTimeout(() => fn(...args)),
};

const profileDatabases: {
  [key: string]: RxDatabase<ProfileSchema>;
} = {};

export const initProfileDatabase = async (
  publicKey: string,
): Promise<RxCollection> => {
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
};

export async function updateProfile(identity: Identity, data: string) {
  const signature = await signData(identity.privateKey, data);

  const insertData: ProfileSchema = {
    id: '1',
    name: {
      data,
      signature,
    },
  };

  const profile = await initProfileDatabase(identity.publicKey);

  profile.upsert(insertData);
}
