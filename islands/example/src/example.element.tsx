import { customElement, noShadowDOM } from 'solid-element';
import {
  generateIdentity,
  exportIdentity,
  Identity,
  decryptIdentity,
} from '@atoll/sdk';
import { createSignal } from 'solid-js';

customElement('atoll-example', { prop: 'atoll-example' }, (props) => {
  noShadowDOM();
  const [identity, setIdentity] = createSignal<Identity>(null);

  const generateID = async () => setIdentity(await generateIdentity());

  const exportID = async () => await exportIdentity();

  const decryptID = async () => await decryptIdentity();

  return (
    <>
      <style>
        {`
        .id {
          word-break: break-all;
          padding: 10px;
          background: #f4f4f4;
          border-radius: 5px;
          border: 1px solid #ccc;
          margin: 10px 0;
        }

        button {
          width: 100%;
          display: block;
          margin: 10px 0;
          padding: 10px;
          background: #333;
          color: #fff;
          border-radius: 5px;
        }
      `}
      </style>
      <div class="id">
        Public Key:
        <br />
        {identity()?.publicKey}
      </div>
      <button onClick={generateID}>Generate ID</button>
      <button onClick={exportID}>Export Private Key</button>
      <button onClick={decryptID}>Import ID</button>
    </>
  );
});
