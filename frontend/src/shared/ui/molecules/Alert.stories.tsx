import type { Meta, StoryObj } from "@storybook/react";
import { Terminal } from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: 'Components/Molecules/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Heads Up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: 'default',
  },
};

export const Destructive: Story = {
    render: (args) => (
      <Alert {...args}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
    ),
    args: {
      variant: 'destructive',
    },
  };

  export const WithIcon: Story = {
    render: (args) => (
      <Alert {...args}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>
    ),
    args: {
        variant: 'default',
    },
    name: "Composition with Icon"
  }; 