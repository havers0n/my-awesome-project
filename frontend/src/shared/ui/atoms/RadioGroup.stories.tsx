import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from ".";
import { Label } from "./Label";

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Atoms/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
  args: {
    defaultValue: 'comfortable',
  },
};

export const Disabled: Story = {
    render: (args) => (
      <RadioGroup {...args}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id="r1-disabled" />
          <Label htmlFor="r1-disabled">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="comfortable" id="r2-disabled" disabled />
          <Label htmlFor="r2-disabled">Comfortable (Item Disabled)</Label>
        </div>
      </RadioGroup>
    ),
    args: {
      defaultValue: 'default',
    },
    name: "Disabled (Group and Item)"
  };

  export const Error: Story = {
    render: (args) => (
      <RadioGroup {...args}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id="r1-error" variant="error" />
          <Label htmlFor="r1-error" className="text-destructive">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="comfortable" id="r2-error" variant="error" />
          <Label htmlFor="r2-error" className="text-destructive">Comfortable</Label>
        </div>
      </RadioGroup>
    ),
    args: {
      defaultValue: 'comfortable',
    },
  }; 