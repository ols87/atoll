import { Options, client, xml } from '@xmpp/client';
import debug from '@xmpp/debug';

const w = window as any;

w.process = {
  ...w.process,
  env: {},
};

let xmpp;

export async function connectToXmpp(connectionOptions?: Options) {
  await registerMessageAccount(
    connectionOptions.username,
    connectionOptions.password,
  );
  xmpp = client({
    service: 'wss://prosody.vudo.tech:5281/xmpp-websocket',
    domain: 'prosody.vudo.tech',
    resource: '',
    username: 'oli',
    password: 'foobar',
    ...connectionOptions,
  });

  debug(xmpp, true);

  xmpp
    .on('stanza', (stanza) => console.log(stanza))
    .on('online', (address) => console.log(address))
    .on('offline', () => console.log('offline'))
    .on('error', (err) => console.error(err))
    .start()
    .catch(console.error);

  return xmpp;
}

export async function sendMessage(address: string, message: string) {
  await xmpp.send(xml('presence'));

  await xmpp.send(
    xml('message', { type: 'chat', to: address }, xml('body', {}, message)),
  );
}

export async function registerMessageAccount(
  username: string,
  password: string,
) {
  const url = 'https://prosody.vudo.tech:5281/http-bind';
  const xml = `
  <body rid='1573741820' xmlns='http://jabber.org/protocol/httpbind' to='prosody.vudo.tech' xml:lang='en' wait='60' hold='1' content='text/xml; charset=utf-8' ver='1.6' xmpp:version='1.0' xmlns:xmpp='urn:xmpp:xbosh'>
      <iq type='set' id='_register1'>
          <query xmlns='jabber:iq:register'>
              <username>${username}</username>
              <password>${password}</password>
          </query>
      </iq>
  </body>`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xml,
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Request failed', error);
  }
}
