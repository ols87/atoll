import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Atoll',
      social: {
        github: 'https://github.com/withastro/starlight',
      },
      sidebar: [
        {
          label: 'Overview',
          items: [
            {
              label: 'What is Atoll?',
              link: '/overview/what-is-atoll',
            },
            {
              label: 'Roadmap',
              link: '/overview/roadmap',
            },
            {
              label: 'Contribute',
              link: '/overview/contribute',
            },
          ],
        },
        {
          label: 'For Users',
          items: [
            {
              label: 'Identities',
              link: '/docs/user/identities',
            },
            {
              label: 'Publishing',
              link: '/docs/user/publishing',
            },
            {
              label: 'Messaging',
              link: '/docs/user/messaging',
            },
            {
              label: 'Monetization',
              link: '/docs/user/nfts',
            },
          ],
        },
        {
          label: 'For Developers',
          items: [
            {
              label: 'Typescript SDK',
              link: '/docs/developer/sdk',
            },
            {
              label: 'Replication Server',
              link: '/docs/developer/messaging-server',
            },
            {
              label: 'XMPP Server',
              link: '/docs/developer/messaging-server',
            },
          ],
        },
      ],
    }),
  ],
});
