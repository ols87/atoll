import { createHelia, libp2pDefaults } from 'helia';
import { createOrbitDB, Identities } from '@orbitdb/core';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';

export const orbit = async () => {
  const id = 'userA';
  const identities = await Identities();
  const identity = await identities.createIdentity({ id });

  console.log(identity);

  const libp2pOptions = libp2pDefaults();

  libp2pOptions.services.pubsub = gossipsub();

  const ipfs = await createHelia({ libp2p: libp2pOptions });
  const orbitdb = await createOrbitDB({ ipfs });
  const db = await orbitdb.open('browser');
  console.log(db.address);
};
