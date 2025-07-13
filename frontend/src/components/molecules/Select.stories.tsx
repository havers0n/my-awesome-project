import type { Meta, StoryObj } from '@storybook/react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Molecules/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;


const renderDefault = (args: any) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
        <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
        <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
        <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
      </SelectContent>
    </Select>
  );

export const Default: Story = {
  render: renderDefault,
  args: {},
};


const renderWithGroups = (args: any) => (
    <Select {...args}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a fruit or vegetable" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="strawberry">Strawberry</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

export const WithGroups: Story = {
    render: renderWithGroups,
    args: {},
};

export const Disabled: Story = {
    render: renderDefault,
    args: {
        disabled: true,
    },
}; 