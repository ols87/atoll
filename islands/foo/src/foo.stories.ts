import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit-html';
import './foo.element';

const meta: Meta = {
  title: 'foo',
  component: 'atoll-foo',
};

export default meta;

type Story = StoryObj;

export const Primary: Story = {
  render: () => html` <atoll-foo></atoll-foo> `,
};
