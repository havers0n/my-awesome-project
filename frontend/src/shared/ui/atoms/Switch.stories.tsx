import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";
import { Label } from "./Label";

const meta: Meta<typeof Switch> = {
  title: 'Design System/Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['default', 'error'],
    },
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    }
  },
  parameters: {
    layout: 'centered',
  }
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    id: 'switch-default',
  },
};

export const Checked: Story = {
  args: {
    id: 'switch-checked',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'switch-disabled',
    disabled: true,
  },
};

export const Error: Story = {
    args: {
      id: 'switch-error',
      variant: 'error',
    },
  };

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" {...args} />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
  args: {
    id: 'airplane-mode',
  },
  name: 'With Label'
};

export const WithLabelError: Story = {
    render: (args) => (
      <div className="flex items-center space-x-2">
        <Switch id="error-mode" {...args} />
        <Label htmlFor="error-mode" className="text-destructive">Airplane Mode</Label>
      </div>
    ),
    args: {
      id: 'error-mode',
      variant: 'error',
      checked: true,
    },
    name: 'With Label (Error)'
  }; 