import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: 'Components/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Active',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Draft',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Archived',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Pending Review',
  },
}; 