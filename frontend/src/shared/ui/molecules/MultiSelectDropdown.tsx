"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, ChevronsUpDown, Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/atoms/Badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/atoms/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/atoms/Popover";

const multiSelectTriggerVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectTriggerVariants> {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  maxCount?: number;
}

const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      value,
      onValueChange,
      variant,
      placeholder = "Select options",
      maxCount = 3,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (selectedValue: string) => {
      if (value.includes(selectedValue)) {
        onValueChange(value.filter((v) => v !== selectedValue));
      } else {
        onValueChange([...value, selectedValue]);
      }
    };

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onValueChange([]);
    };

    const selectedLabels = React.useMemo(() => {
      return options
        .filter((option) => value.includes(option.value))
        .map((option) => option.label);
    }, [options, value]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            className={cn(multiSelectTriggerVariants({ variant, className }))}
            role="combobox"
            aria-expanded={open}
            {...props}
          >
            <div className="flex flex-wrap items-center gap-1">
              {selectedLabels.length > 0 ? (
                <>
                  {selectedLabels.slice(0, maxCount).map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {label}
                    </Badge>
                  ))}
                  {selectedLabels.length > maxCount && (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      +{selectedLabels.length - maxCount} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center">
              {value.length > 0 && (
                <button
                  onClick={handleClear}
                  className="mr-2 h-4 w-4 opacity-50 hover:opacity-100"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect }; 