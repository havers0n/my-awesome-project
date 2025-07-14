import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/shared/ui/atoms/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";
import { Info } from "lucide-react";

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-10">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  name: 'Default Usage',
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover over me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a simple text tooltip.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const ComplexContent: Story = {
  name: 'With Complex Content',
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" className="h-8 w-8 p-0">
          <Info className="h-4 w-4" />
          <span className="sr-only">Show Details</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="text-left">
          <h4 className="font-bold">Forecast Metrics</h4>
          <p className="pt-1 text-sm text-muted-foreground">
            This card shows the key performance indicators for the sales
            forecast.
          </p>
          <div className="mt-2 border-t border-border pt-2 text-xs">
            Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}; 