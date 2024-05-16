import { customElement, noShadowDOM } from 'solid-element';
import { generateIdentity, exportIdentity, Identity } from '@atoll/sdk';
import { createSignal } from 'solid-js';

customElement('atoll-example', { prop: 'atoll-example' }, (props) => {
  noShadowDOM();
  const [identity, setIdentity] = createSignal<Identity>(null);

  const generateID = async () => setIdentity(await generateIdentity());

  const exportID = async () => {
    console.log(await exportIdentity());
  };

  return (
    <>
      {identity()?.publicKey}
      <button onClick={generateID}>Generate ID</button>
      <button onClick={exportID}>Export Private Key</button>
    </>
  );
});
