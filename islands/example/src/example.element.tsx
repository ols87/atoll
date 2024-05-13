import { customElement, noShadowDOM } from 'solid-element';

customElement('atoll-example', { prop: 'atoll-example' }, (props) => {
  noShadowDOM();
  return <div>{props.prop} works</div>;
});
