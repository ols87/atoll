import { RxCollection, RxConflictHandlerInput } from 'rxdb';
import { isDeepEqual } from '../utils';
import {
  replicateWebRTC,
  getConnectionHandlerSimplePeer,
} from 'rxdb/plugins/replication-webrtc';
import { verifySignature } from '../identity';

export type SignedProp = {
  data: string;
  signature: any;
};

export async function verifySignedWrite<T>(
  publicKey: string,
  instance: RxConflictHandlerInput<T>,
): Promise<{ isEqual: false; documentData: any } | { isEqual: true }> {
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
      signalingServerUrl: 'ws://77.37.67.224:8080',
    }),
    pull: {},
    push: {},
  });

  pool.error$.subscribe((err) => console.log(err));
  pool.peerStates$.subscribe((peerState) => console.log(peerState));
}
