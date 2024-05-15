import { customElement, noShadowDOM } from 'solid-element';
import { sdk } from '@atoll/sdk';

customElement('atoll-example', { prop: 'atoll-example' }, (props) => {
  noShadowDOM();

  const initSDK = () => {
    sdk();
  };

  return <button onClick={initSDK}>Click me</button>;
});
