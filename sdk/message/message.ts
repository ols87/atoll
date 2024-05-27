import { Client, Options, client, xml } from '@xmpp/client';
// import debug from '@xmpp/debug';

const w = window as any;

w.process = {
  ...w.process,
  env: {},
};

let xmpp: Client;

/**
 * Establishes a connection to the XMPP server.
 *
 * @param connectionOptions - Optional parameters to customize the connection.
 * @returns The XMPP client instance.
 */
export async function connectToXmpp(connectionOptions?: Options) {
  try {
    xmpp = client({
      service: 'wss://prosody.vudo.tech:5281/xmpp-websocket',
      domain: 'prosody.vudo.tech',
      resource: 'chat',
      username: 'oli',
      password: 'foobar',
      ...connectionOptions,
    });

    xmpp
      .on('online', (address) => console.log(address))
      .on('offline', () => console.log('offline'))
      .on('error', (err) => console.error(err))
      .start()
      .then(async () => await xmpp.send(xml('presence')))
      .catch(console.error);

    return xmpp;
  } catch (error) {
    console.error('Failed to connect to XMPP:', error);
  }
}

/**
 * Registers a new message account with the XMPP server.
 *
 * @param username - The desired username for the account.
 * @param password - The password for the account.
 */
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

/**
 * Sends a chat message to the specified address.
 *
 * @param address - The recipient's address.
 * @param message - The message to send.
 */
export async function sendMessage(address: string, message: string) {
  try {
    await xmpp.send(
      xml(
        'message',
        { type: 'chat', to: `${address}@prosody.vudo.tech` },
        xml('body', {}, message),
      ),
    );
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

/**
 * Represents a message management class with utility methods.
 */
export class AtollMessage {
  static connect(...args: Parameters<typeof connectToXmpp>) {
    return connectToXmpp(...args);
  }

  /**
   * Sends a message using the specified arguments.
   * @see {@link sendMessage} for more details.
   * @param...args Arguments passed to the sendMessage function.
   * @returns A promise that resolves to the sent message object.
   */
  static send(...args: Parameters<typeof sendMessage>) {
    return sendMessage(...args);
  }

  /**
   * Registers a message account using the specified arguments.
   * @see {@link registerMessageAccount} for more details.
   * @param...args Arguments passed to the registerMessageAccount function.
   * @returns A promise that resolves to the registered account object.
   */
  static registerAccount(...args: Parameters<typeof registerMessageAccount>) {
    return registerMessageAccount(...args);
  }
}
