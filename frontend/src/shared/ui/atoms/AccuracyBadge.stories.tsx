import type { Meta, StoryObj } from "@storybook/react";
import { AccuracyBadge } from "./AccuracyBadge";

const meta: Meta<typeof AccuracyBadge> = {
  title: 'Atoms/AccuracyBadge',
  component: AccuracyBadge,
  tags: ['autodocs'],
  argTypes: {
    accuracy: {
      control: 'radio',
      options: ['Высокая', 'Средняя', 'Низкая'],
      description: 'The accuracy level, which determines the badge color.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {
  args: {
    accuracy: 'Высокая',
  },
};

export const Medium: Story = {
  args: {
    accuracy: 'Средняя',
  },
};

export const Low: Story = {
  args: {
    accuracy: 'Низкая',
  },
}; 