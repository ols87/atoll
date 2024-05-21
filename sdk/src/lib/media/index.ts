import { unixfs } from '@helia/unixfs';
import { createHelia } from 'helia';

let helia = null;

export async function uploadMedia(name: string, content: string) {
  name = name || 'foo.txt';
  content = content || 'Hello, world!';

  if (!helia) {
    console.log('Creating Helia node...');

    helia = await createHelia();
  }

  const encoder = new TextEncoder();

  const file = {
    path: `${name}`,
    content: encoder.encode(content),
  };

  const fs = unixfs(helia);

  const cid = await fs.addFile(file, helia.blockstore);

  const decoder = new TextDecoder();
  let text = '';

  for await (const chunk of fs.cat(cid)) {
    text += decoder.decode(chunk, {
      stream: true,
    });
  }

  console.log(text);

  console.log(`Preview: https://ipfs.io/ipfs/${cid}`);
}
