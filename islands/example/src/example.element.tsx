import { customElement, noShadowDOM } from 'solid-element';
import {
  generateIdentity,
  importIdentityDatabase,
  exportIdentityDatabase,
} from '@atoll/sdk';
import { createSignal } from 'solid-js';

customElement('atoll-example', { prop: 'atoll-example' }, (props) => {
  noShadowDOM();
  const [identity, setIdentity] = createSignal(null);

  const generateID = async () => setIdentity(await generateIdentity());

  const exportIdDb = async () => await exportIdentityDatabase('foo');

  const importIdDB = async () =>
    setIdentity(await importIdentityDatabase('foo'));

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
      <button onClick={exportIdDb}>Export ID DB</button>
      <button onClick={importIdDB}>Import ID DB</button>
    </>
  );
});
