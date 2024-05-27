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
            // Each item here is one entry in the navigation menu.
            {
              label: 'What is Atoll?',
              link: '/about/what-is-atoll',
            },
          ],
        },
      ],
    }),
  ],
});
