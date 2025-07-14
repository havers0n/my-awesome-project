import type { Meta, StoryObj } from "@storybook/react";
import { SnapshotCard, type SnapshotCardProps } from "./SnapshotCard";
import type { ProductSnapshot } from "@/types/warehouse";

const meta: Meta<typeof SnapshotCard> = {
  title: 'Molecules/SnapshotCard',
  component: SnapshotCard,
  tags: ['autodocs'],
  argTypes: {
    productName: { control: 'text' },
    snapshot: { control: 'object' },
    quantity: { control: 'number' },
    isLoading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockSnapshot: ProductSnapshot = {
  avgSales7d: 12.5,
  avgSales30d: 15.2,
  salesLag1d: 10,
};

export const Default: Story = {
  args: {
    productName: 'Колбаса докторская',
    snapshot: mockSnapshot,
    quantity: 36,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    isLoading: false,
    productName: undefined,
    snapshot: undefined,
    quantity: undefined,
  },
}; 