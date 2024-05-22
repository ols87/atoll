import {
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
import { signData, verifySignature } from '../utils';

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

let profileDatabase: RxDatabase;

export const initProfileDatabase = async (publicKey: string) => {
  if (profileDatabase) return profileDatabase.collections.profile;

  profileDatabase = await createRxDatabase({
    name: `atoll__${publicKey}__profile`,
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

  const collections = await profileDatabase.addCollections({
    profile: {
      schema: profileSchema,
      conflictHandler: (instance: RxConflictHandlerInput<ProfileSchema>) => {
        const { newDocumentState, realMasterState } = instance;

        let isEqual = false;

        Object.keys(newDocumentState).forEach((key) => {
          const prop = newDocumentState[key] as SignedProp;

          isEqual = verifySignature({
            publicKey,
            data: prop.data,
            signature: prop.signature,
          });
        });

        return Promise.resolve({
          isEqual,
          documentData: isEqual ? newDocumentState : realMasterState,
        });
      },
    },
  });

  collections.profile.$.subscribe((changeEvent) => {
    console.log(changeEvent);
  });

  const pool = await replicateWebRTC({
    collection: collections.profile,
    topic: `atoll:${publicKey}:profile:pool`,
    connectionHandlerCreator: getConnectionHandlerSimplePeer({
      signalingServerUrl: 'ws://77.37.67.224:8080',
    }),
  });

  pool.error$.subscribe((err) => console.log(err));
  pool.peerStates$.subscribe((peerState) => console.log(peerState));

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

  await profile.upsert(insertData);
}
