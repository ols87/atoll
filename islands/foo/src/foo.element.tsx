import { customElement, noShadowDOM } from 'solid-element';

customElement('atoll-foo', { prop: 'atoll-foo' }, (props) => {
  noShadowDOM();
  return <div>{props.prop} works</div>;
});
