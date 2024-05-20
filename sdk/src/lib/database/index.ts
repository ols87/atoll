import { WebRTC as WebRTCMatcher } from '@multiformats/multiaddr-matcher';
import pRetry from 'p-retry';
import { multiaddr } from '@multiformats/multiaddr';
import { createHelia, libp2pDefaults } from 'helia';
import { createOrbitDB } from '@orbitdb/core';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { createLibp2p } from 'libp2p';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
import { noise } from '@chainsafe/libp2p-noise';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import * as filters from '@libp2p/websockets/filters';
import delay from 'delay';

const libp2pOptions = libp2pDefaults();
libp2pOptions.services.pubsub = gossipsub();

let orbitdb: any;

export async function getOrbitDB() {
  const options = {
    addresses: {
      listen: ['/webrtc'],
    },
    transports: [
      webSockets({
        filter: filters.all,
      }),
      webRTC(),
      circuitRelayTransport({
        discoverRelays: 1,
      }),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: async () => {
        return false;
      },
    },
    services: {
      identify: identify(),
      pubsub: gossipsub(),
    },
  };

  const libp2p = await createLibp2p(options);
  const ipfs = await createHelia({ libp2p });
  orbitdb = orbitdb || (await createOrbitDB({ ipfs }));

  const relay = [
    multiaddr(
      '/ip4/10.0.0.184/tcp/39889/ws/p2p/12D3KooWNLo9JeFVvh3zaVW3CaGkZmmVHq9uA19anfLPkUX6YQNU',
    ),
    multiaddr(
      '/ip4/127.0.0.1/tcp/39889/ws/p2p/12D3KooWNLo9JeFVvh3zaVW3CaGkZmmVHq9uA19anfLPkUX6YQNU',
    ),
  ];

  await ipfs.libp2p.dial(relay);

  const a1 = await pRetry(async () => {
    const addr = ipfs.libp2p
      .getMultiaddrs()
      .filter((ma) => WebRTCMatcher.matches(ma))
      .pop();

    if (addr == null) {
      await delay(10);
      throw new Error('No WebRTC address found');
    }

    return addr;
  });

  console.log('ipfs1 address discovered: ', a1);
}

export const createDatabase = async (args: { identity: any; name: string }) => {
  const { identity, name } = args;

  await getOrbitDB();
  const db = await orbitdb.open(name);

  await db.add('hello, world!');

  console.log(db);
};

export const getDatabase = async () => {
  const address = '/orbitdb/zdpuB3KEPJeQ2CCVJgosv4QWtKehLdqzphBcDkkAh69TCZHV8';

  console.log(address);

  await getOrbitDB();
  const db = await orbitdb.open(address);

  console.log(db);
};
