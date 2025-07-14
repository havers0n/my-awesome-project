import * as React from "react";
import { Label } from "@/shared/ui/atoms/Label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/molecules/Select";
import { twMerge } from "tailwind-merge";
import type { ComponentPropsWithoutRef } from "react";

interface SelectFieldProps extends ComponentPropsWithoutRef<typeof Select> {
  label: string;
  id?: string;
  error?: string;
  placeholder?: string;
  containerClassName?: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

const SelectField = ({
  label,
  id,
  error,
  placeholder,
  containerClassName,
  children,
  onValueChange,
  ...props
}: SelectFieldProps) => {
  const selectId = id || React.useId();
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={twMerge('grid w-full items-center gap-1.5', containerClassName)}>
      <Label htmlFor={selectId}>{label}</Label>
      <Select onValueChange={onValueChange} {...props}>
        <SelectTrigger
          id={selectId}
          className={error ? 'border-destructive focus:ring-destructive' : ''}
          aria-invalid={!!error}
          aria-describedby={errorId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {error && <p id={errorId} className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export { SelectField }; 