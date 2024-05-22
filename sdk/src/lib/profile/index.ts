import { RxConflictHandlerInput, RxJsonSchema, addRxPlugin } from 'rxdb';
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
  value: string;
  signature: any;
};

type ProfileSchema = {
  id: string;
  name: SignedProp;
};

export const initProfileDatabase = async (identity: Identity) => {
  const db = await createRxDatabase({
    name: `atoll__${identity.publicKey}__profile`,
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

  const collections = await db.addCollections({
    profile: {
      schema: profileSchema,
      conflictHandler: (instance: RxConflictHandlerInput<ProfileSchema>) => {
        const { newDocumentState, realMasterState } = instance;

        let isEqual = false;

        Object.keys(newDocumentState).forEach((key) => {
          const prop = newDocumentState[key] as SignedProp;

          isEqual = verifySignature({
            publicKey: identity.publicKey,
            data: prop.value,
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

  return collections.profile;

  // const pool = await replicateWebRTC({
  //   collection: collections.profile,
  //   topic: `atoll:${identity.publicKey}:profile:pool`,
  //   connectionHandlerCreator: getConnectionHandlerSimplePeer({
  //     signalingServerUrl: 'ws://77.37.67.224:8080',
  //   }),
  // });

  // pool.error$.subscribe((err) => console.log(err));
  // pool.peerStates$.subscribe((peerState) => console.log(peerState));
};

export async function updateProfile(identity: Identity, name: string) {
  const signature = await signData(identity.privateKey, name);

  const insertData: ProfileSchema = {
    id: '1',
    name: {
      value: name,
      signature,
    },
  };

  const profile = await initProfileDatabase(identity);

  await profile.upsert(insertData);
}
