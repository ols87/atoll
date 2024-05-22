import {
  RxCollection,
  RxConflictHandlerInput,
  RxDatabase,
  RxJsonSchema,
  addRxPlugin,
} from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import {
  replicateWebRTC,
  getConnectionHandlerSimplePeer,
} from 'rxdb/plugins/replication-webrtc';
import { Identity } from '../identity';
import { isDeepEqual, signData, verifySignature } from '../utils';

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);

const w = window as any;

w.process = {
  nextTick: (fn: any, ...args: any) => setTimeout(() => fn(...args)),
};

type SignedProp = {
  data: string;
  signature: any;
};

type ProfileSchema = {
  id: string;
  name: SignedProp;
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

  const profileSchema: RxJsonSchema<ProfileSchema> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 100,
      },
      name: {
        type: 'object',
      },
    },
    required: ['id', 'name'],
  };

  const collections = await profileDatabases[name].addCollections({
    profile: {
      schema: profileSchema,
      conflictHandler: (instance: RxConflictHandlerInput<ProfileSchema>) => {
        const { newDocumentState, realMasterState } = instance;

        if (isDeepEqual(newDocumentState, realMasterState))
          return Promise.resolve({
            isEqual: true,
          });

        let isSigned = true;

        Object.keys(realMasterState).forEach(async (key) => {
          const prop = realMasterState[key] as SignedProp;

          if (!isSigned) return;

          if (prop.data) {
            console.log(prop);
            isSigned = await verifySignature({
              publicKey,
              data: prop.data,
              signature: prop.signature,
            });

            // console.log('Conflict', prop.data, prop.signature, publicKey);
          }
        });

        console.log(isSigned);

        return Promise.resolve({
          isEqual: false,
          documentData: isSigned ? realMasterState : newDocumentState,
        });
      },
    },
  });

  const pool = await replicateWebRTC({
    collection: collections.profile,
    topic: `${name.substring(0, 64)}-profile-pool`,
    connectionHandlerCreator: getConnectionHandlerSimplePeer({
      signalingServerUrl: 'ws://77.37.67.224:8080',
    }),
    pull: {},
    push: {},
  });

  pool.error$.subscribe((err) => console.log(err));
  pool.peerStates$.subscribe((peerState) => console.log(peerState));

  return collections.profile;
};

export async function updateProfile(identity: Identity, data: string) {
  const signature = await signData(identity.privateKey, data);

  console.log(
    await verifySignature({ publicKey: identity.publicKey, data, signature }),
  );

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
