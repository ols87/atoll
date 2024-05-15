import { RxJsonSchema, addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import {
  replicateWebRTC,
  getConnectionHandlerSimplePeer,
} from 'rxdb/plugins/replication-webrtc';

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);

const w = window as any;

w.process = {
  nextTick: (fn: any, ...args: any) => setTimeout(() => fn(...args)),
};

export const rxdb = async () => {
  const db = await createRxDatabase({
    name: 'atoll',
    storage: getRxStorageDexie(),
  });

  type ProfileSchema = {
    id: string;
    name: string;
  };

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
        type: 'string',
      },
    },
    required: ['id', 'name'],
  };

  const collections = await db.addCollections({
    profile: {
      schema: profileSchema,
    },
  });

  // collections.profile.$.subscribe((changeEvent) => {
  //   console.log(changeEvent);
  // });

  // await collections.profile.upsert({
  //   id: '1',
  //   name: 'b',
  // });

  const pool = await replicateWebRTC({
    collection: collections.profile,
    topic: 'profile-pool',
    connectionHandlerCreator: getConnectionHandlerSimplePeer({
      signalingServerUrl: 'ws://77.37.67.224:8080',
    }),
    pull: {},
    push: {},
  });

  pool.error$.subscribe((err) => console.log(err));
  pool.peerStates$.subscribe((peerState) => console.log(peerState));
};
