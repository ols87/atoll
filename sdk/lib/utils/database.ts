import { RxCollection, RxConflictHandlerInput, addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { isDeepEqual } from './utils';
import {
  replicateWebRTC,
  getConnectionHandlerSimplePeer,
} from 'rxdb/plugins/replication-webrtc';
import { verifySignature } from '../identity';
import { ec as EC } from 'elliptic';
addRxPlugin(RxDBDevModePlugin);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;
w.process = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextTick: (fn: any, ...args: any) => setTimeout(() => fn(...args)),
};

export type SignedProp = {
  data: string;
  signature: EC.Signature;
};

export const signedPropType = {
  type: 'object',
};

export async function verifySignedWrite<T>(
  publicKey: string,
  instance: RxConflictHandlerInput<T>,
): Promise<{ isEqual: false; documentData: T } | { isEqual: true }> {
  const { newDocumentState, realMasterState } = instance;

  if (isDeepEqual(newDocumentState, realMasterState))
    return Promise.resolve({ isEqual: true });

  let isSigned = true;

  Object.keys(realMasterState).forEach(async (key) => {
    const prop = realMasterState[key] as SignedProp;

    if (!isSigned) return;

    if (prop.data) {
      isSigned = await verifySignature({
        publicKey,
        data: prop.data,
        signature: prop.signature,
      });
    }
  });

  return Promise.resolve({
    isEqual: false,
    documentData: isSigned ? realMasterState : newDocumentState,
  });
}

export async function replicateCollection(
  collection: RxCollection,
  topic: string,
) {
  const pool = await replicateWebRTC({
    collection,
    topic,
    connectionHandlerCreator: getConnectionHandlerSimplePeer({
      signalingServerUrl: 'ws://77.37.67.224:80',
    }),
    pull: {},
    push: {},
  });

  pool.error$.subscribe((err) => console.log(err));
  pool.peerStates$.subscribe((peerState) => console.log(peerState));
}

export class AtollDatabase {
  static verifySignedWrite(...args: Parameters<typeof verifySignedWrite>) {
    return verifySignedWrite(...args);
  }

  static replicateCollection(...args: Parameters<typeof replicateCollection>) {
    return replicateCollection(...args);
  }
}
