import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit-html';
import './profile.element';

const meta: Meta = {
  title: 'profile',
  component: 'atoll-profile',
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
  render: () => html` <atoll-profile></atoll-profile> `,
};
