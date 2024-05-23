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

export async function upsertProfile(
  identity: Identity,
  writeData: TypedObject<ProfileWriteSchema, string>,
) {
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
}

export class AtollProfile {
  static schema = profileSchema;
  static databases = profileDatabases;

  static initDatabase(...args: Parameters<typeof initProfileDatabase>) {
    return initProfileDatabase(...args);
  }

  static upsert(...args: Parameters<typeof upsertProfile>) {
    return upsertProfile(...args);
  }
}
