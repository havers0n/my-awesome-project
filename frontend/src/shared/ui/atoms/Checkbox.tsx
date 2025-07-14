'use client';

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { twMerge } from "tailwind-merge";

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  {
    variants: {
      variant: {
        default: 'border-primary',
        error: 'border-destructive text-destructive focus-visible:ring-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={twMerge(checkboxVariants({ variant, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={twMerge('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
export default Checkbox;
