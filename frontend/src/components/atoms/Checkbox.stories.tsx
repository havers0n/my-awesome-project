import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { Label } from './Label';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error'],
    },
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    }
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    id: 'checkbox-default',
  },
};

export const Checked: Story = {
  args: {
    id: 'checkbox-checked',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'checkbox-disabled',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
    args: {
      id: 'checkbox-disabled-checked',
      checked: true,
      disabled: true,
    },
  };

export const Error: Story = {
  args: {
    id: 'checkbox-error',
    variant: 'error',
  },
};

export const ErrorChecked: Story = {
    args: {
      id: 'checkbox-error-checked',
      variant: 'error',
      checked: true,
    },
  };


export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox {...args} />
      <Label htmlFor={args.id}>Accept terms and conditions</Label>
    </div>
  ),
  args: {
    id: 'checkbox-with-label',
  },
};

export const WithLabelError: Story = {
    render: (args) => (
      <div className="flex items-center space-x-2">
        <Checkbox {...args} />
        <Label htmlFor={args.id} className="text-destructive">You must accept the terms</Label>
      </div>
    ),
    args: {
        id: 'checkbox-with-label-error',
        variant: 'error',
    },
    name: "With Label (Error State)"
}; 