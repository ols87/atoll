import { customElement, noShadowDOM } from 'solid-element';
import {
  generateIdentity,
  importIdentityDatabase,
  exportIdentityDatabase,
  updateProfile,
  uploadMedia,
  rand,
  initProfileDatabase,
} from '@atoll/sdk';
import { createSignal } from 'solid-js';

customElement('atoll-example', { prop: 'atoll-example' }, (props) => {
  noShadowDOM();

  const [identity, setIdentity] = createSignal(null);

  const generateID = async () => setIdentity(await generateIdentity());

  const updateName = async () => await updateProfile(identity(), 'Foobar');

  const exportIdDb = async () => await exportIdentityDatabase('foo');

  const importIdDB = async () =>
    setIdentity(await importIdentityDatabase('foo'));

  const watch = async () => {
    const publicKey = document.getElementById('publicKey') as HTMLInputElement;
    const profile = await initProfileDatabase(publicKey.value);
    console.log(profile);
    profile.$.subscribe((changeEvent) => {
      console.log(changeEvent);
    });
  };

  return (
    <>
      <div class="id">
        Public Key:
        <br />
        {identity()?.publicKey}
      </div>

      <button onClick={generateID}>Generate ID</button>
      <button onClick={updateName}>Update Name</button>
      <button onClick={exportIdDb}>Export ID DB</button>
      <button onClick={importIdDB}>Import ID DB</button>
      <input
        type="text"
        id="publicKey"
        value="040759c491906c72ab2277709f857bd735155e609b904805c6a947be6f05899b4c3fe73705fe735dcb1211f4b44d2816446b36db1389af9f7608aeea9dcfa1efaf"
      />
      <button onClick={watch}>Watch Profile</button>

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

        input {
          width: calc(100% - 22px);
          display: block;
          padding: 10px;
          background: #f4f4f4;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
      `}
      </style>
    </>
  );
});
