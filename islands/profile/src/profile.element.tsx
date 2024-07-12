import { customElement, noShadowDOM } from 'solid-element';

customElement('atoll-profile', { prop: 'atoll-profile' }, (props) => {
  noShadowDOM();
  return <div>{props.prop} works</div>;
});
