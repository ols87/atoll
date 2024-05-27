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
              label: 'What is Atoll?',
              link: '/about/what-is-atoll',
            },
            {
              label: 'Philosophy',
              link: '/about/philosophy',
            },
            {
              label: 'Roadmap',
              link: '/about/roadmap',
            },
          ],
        },
        {
          label: 'For Users',
          items: [
            {
              label: 'Getting Started',
              link: '/docs/user/getting-started',
            },
            {
              label: 'Accounts',
              link: '/docs/user/accounts',
            },
            {
              label: 'Posts',
              link: '/docs/user/posts',
            },
          ],
        },
        {
          label: 'For Developers',
          items: [
            {
              label: 'Installation',
              link: '/docs/developer/installation',
            },
            {
              label: 'Configuration',
              link: '/docs/developer/configuration',
            },
            {
              label: 'SDK',
              link: '/docs/developer/sdk',
            },
            {
              label: 'Messaging Server',
              link: '/docs/developer/messaging-server',
            },
          ],
        },
      ],
    }),
  ],
});
