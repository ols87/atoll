import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';
import { strings } from '@helia/strings';
import { rand } from '../utils';
let helia = null;

export async function uploadMedia(name: string, content: string) {
  name = name || 'foo.txt';
  content = content || 'Hello, world!';

  if (!helia) {
    console.log('Creating Helia node...');

    helia = await createHelia();

    helia.libp2p.addEventListener('peer:discovery', (evt) => {
      (window as any).discoveredPeers?.set(
        evt.detail.id.toString(),
        evt.detail,
      );
      console.log(`Discovered peer ${evt.detail.id.toString()}`);
    });
  }

  const string = strings(helia);

  const cid = await string.add(rand(20));

  console.log(`Preview: https://ipfs.io/ipfs/${cid.toString()}`);
}
