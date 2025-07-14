import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: 'Components/Atoms/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Your Name',
  },
};

export const PairedWithInput: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">{args.children}</Label>
      <Input type="email" id="email" placeholder="email@example.com" />
    </div>
  ),
  args: {
    children: 'Email Address',
  },
};

export const PairedWithDisabledInput: Story = {
    render: (args) => (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="name">{args.children}</Label>
        <Input type="text" id="name" placeholder="Name" disabled />
      </div>
    ),
    args: {
      children: 'Name (label styles should reflect disabled peer)',
    },
    name: 'Demonstrates peer-disabled state'
  }; 