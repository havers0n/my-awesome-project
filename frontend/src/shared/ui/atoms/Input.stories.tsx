import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: 'Components/Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error'],
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    type: {
      control: 'text',
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    type: 'text',
  },
};

export const WithPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: 'Type something...',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    placeholder: 'email@example.com',
  },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        placeholder: 'Disabled input',
        disabled: true,
    },
  }; 