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
          label: 'About',
          items: [
            {
              label: 'Philosophy',
              link: '/about/philosophy',
            },
            {
              label: 'Roadmap',
              link: '/about/roadmap',
            },
            {
              label: 'Contribute',
              link: '/about/contribute',
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
              label: 'Profiles',
              link: '/docs/user/profile',
            },
            {
              label: 'Posts',
              link: '/docs/user/posts',
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
