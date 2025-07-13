import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    id: 'email-default',
  },
};

export const WithPlaceholder: Story = {
    args: {
        ...Default.args,
        id: 'email-placeholder',
        placeholder: 'your.email@example.com',
    },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    id: 'email-error',
    placeholder: 'your.email@example.com',
    error: 'Please enter a valid email address.',
  },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        id: 'email-disabled',
        placeholder: 'your.email@example.com',
        disabled: true,
    },
    name: "Disabled (demonstrates peer-disabled)"
}; 