import * as React from "react";
import { Input, type InputProps } from "@/shared/ui/atoms/Input";
import { Label } from "@/shared/ui/atoms/Label";
import { twMerge } from "tailwind-merge";

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, error, containerClassName, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className={twMerge("grid w-full items-center gap-1.5", containerClassName)}>
        <Label htmlFor={inputId}>
          {label}
        </Label>
        <Input
          id={inputId}
          ref={ref}
          variant={error ? 'error' : 'default'}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField }; 