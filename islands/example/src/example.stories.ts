import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit-html';
import './example.element';

const meta: Meta = {
  title: 'example',
  component: 'atoll-example',
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
  render: () => html` <atoll-example></atoll-example> `,
};
