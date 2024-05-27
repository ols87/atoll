import { connectToXmpp } from '@atoll/sdk';
import { customElement, noShadowDOM } from 'solid-element';

customElement('atoll-chat', { prop: 'atoll-chat' }, (props) => {
  noShadowDOM();
  return (
    <>
      <div>
        <input type="text" placeholder="Username" />
        <input type="text" placeholder="Password" />
        <button
          onClick={async () => {
            const username = (
              document.querySelector(
                'input[placeholder="Username"]',
              ) as HTMLInputElement
            ).value;

            const password = (
              document.querySelector(
                'input[placeholder="Password"]',
              ) as HTMLInputElement
            ).value;

            await connectToXmpp({
              username,
              password,
            });
          }}
        >
          Authenticate
        </button>
        <hr />
        <br />
        <input type="text" placeholder="Recipient" />
        <textarea id="message-input" rows="3" placeholder="Message"></textarea>
        <button>Send</button>
        <div>Hello</div>
      </div>

      <style>
        {`
          * {
            box-sizing: border-box;
          }
          
          input, textarea, button {
            width: 100%;
            margin-bottom: 10px;
            padding:10px;
          }
      `}
      </style>
    </>
  );
});
