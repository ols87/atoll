import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit-html';
import './chat.element';

const meta: Meta = {
  title: 'chat',
  component: 'atoll-chat',
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
  render: () => html` <atoll-chat></atoll-chat> `,
};
