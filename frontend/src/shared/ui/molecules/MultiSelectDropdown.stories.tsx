import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "./MultiSelectDropdown";
import { useState } from "react";

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Molecules/MultiSelectDropdown',
  component: MultiSelect,
  tags: ['autodocs'],
  argTypes: {
    options: { control: { type: 'object' } },
    value: { control: { type: 'object' } },
    onValueChange: { action: 'onValueChange' },
    placeholder: { control: 'text' },
    maxCount: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value || []);
    return (
      <div className="w-80">
        <MultiSelect
          {...args}
          value={value}
          onValueChange={(newValue) => {
            setValue(newValue);
            args.onValueChange(newValue);
          }}
        />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: frameworks,
    value: [],
    placeholder: 'Select a framework...',
  },
};

export const WithPreselectedValues: Story = {
  args: {
    options: frameworks,
    value: ['react', 'vue'],
    placeholder: 'Select a framework...',
  },
};

export const ExceedingMaxCount: Story = {
  args: {
    options: frameworks,
    value: ['react', 'angular', 'vue', 'svelte'],
    placeholder: 'Select a framework...',
    maxCount: 2,
  },
};

export const Disabled: Story = {
  args: {
    options: frameworks,
    value: ['react'],
    placeholder: 'Select a framework...',
    disabled: true,
  },
}; 