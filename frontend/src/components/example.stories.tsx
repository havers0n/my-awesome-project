import type { Meta, StoryObj } from '@storybook/react';

// Простой компонент для демонстрации
const ExampleComponent = ({ text = 'Hello Storybook!' }: { text?: string }) => {
  return (
    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
      <h2 className="text-xl font-bold text-blue-800 mb-2">Example Component</h2>
      <p className="text-blue-600">{text}</p>
    </div>
  );
};

const meta: Meta<typeof ExampleComponent> = {
  title: 'Example/ExampleComponent',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Hello Storybook!',
  },
};

export const CustomText: Story = {
  args: {
    text: 'This is a custom message',
  },
};

export const LongText: Story = {
  args: {
    text: 'This is a very long text to demonstrate how the component handles longer content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
};
