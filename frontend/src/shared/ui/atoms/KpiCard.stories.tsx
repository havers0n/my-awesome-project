import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard } from "./KpiCard";

const meta: Meta<typeof KpiCard> = {
  title: 'Atoms/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Card title' },
    value: { control: 'text', description: 'Main KPI value' },
    change: { control: 'text', description: 'Change value (e.g., "+5.2%")' },
    changeType: {
      control: 'radio',
      options: ['positive', 'negative'],
      description: 'Type of change to control color and icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PositiveChange: Story = {
  args: {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
  },
};

export const NegativeChange: Story = {
  args: {
    title: 'Subscriptions',
    value: '2,350',
    change: '-2.3%',
    changeType: 'negative',
  },
};

export const WithoutChange: Story = {
  args: {
    title: 'Total Sales',
    value: '3,456',
  },
}; 