import { connectToXmpp, registerMessageAccount, sendMessage } from '@atoll/sdk';
import { customElement, noShadowDOM } from 'solid-element';
import { createSignal } from 'solid-js';

customElement('atoll-chat', { prop: 'atoll-chat' }, (props) => {
  noShadowDOM();

  const [messages, setMessages] = createSignal([]);

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

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

          if (!username || !password) return;

          const xmpp = await connectToXmpp({
            username,
            password,
          });

          localStorage.setItem('xmpp', JSON.stringify({ username, password }));

          xmpp.on('stanza', (stanza) => {
            console.log(stanza);

            const message = stanza.getChildText('body');
            const from = stanza.attrs.from;

            if (stanza.is('message') && message) {
              setMessages([...messages(), { from, message }]);
            }
          });
        }}
      >
        <h3>Auth</h3>
        <input
          type="text"
          placeholder="Username"
          value={(() =>
            JSON.parse(localStorage.getItem('xmpp'))?.username || '')()}
          required
        />
        <input
          type="text"
          placeholder="Password"
          value={(() =>
            JSON.parse(localStorage.getItem('xmpp'))?.password || '')()}
          required
        />
        <button>Authenticate</button>
        <button
          type="button"
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

            await registerMessageAccount(username, password);
          }}
        >
          Register
        </button>
      </form>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const recipient = (
            document.querySelector(
              'input[placeholder="Recipient"]',
            ) as HTMLTextAreaElement
          ).value;

          const message = (
            document.querySelector(
              'textarea#message-input',
            ) as HTMLTextAreaElement
          ).value;

          if (!recipient || !message) return;

          await sendMessage(recipient, message);

          setMessages([...messages(), { to: recipient, message }]);
        }}
      >
        <h3>Chat</h3>
        <input type="text" placeholder="Recipient" required />
        <textarea
          id="message-input"
          rows="3"
          placeholder="Message"
          required
        ></textarea>
        <button>Send</button>
        <div>
          <div>
            {messages().map((msg) => (
              <div style="margin-bottom:10px">
                <b>
                  {(msg.from || msg.to).replace('@prosody.vudo.tech/chat', '')}
                </b>
                : {msg.message}
              </div>
            ))}
          </div>
        </div>
      </form>

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          form {
            margin-bottom:20px;
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
