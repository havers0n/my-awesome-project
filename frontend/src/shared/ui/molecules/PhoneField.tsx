import * as React from "react";
import { Label } from "@/shared/ui/atoms/Label";
import { PhoneInput, type PhoneInputProps } from "@/shared/ui/molecules/PhoneInput";

export interface PhoneFieldProps extends PhoneInputProps {
  id: string;
  label: string;
  error?: string;
}

const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  ({ id, label, error, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor={id} variant={hasError ? 'destructive' : 'default'}>
          {label}
        </Label>
        <PhoneInput
          id={id}
          ref={ref}
          variant={hasError ? 'error' : 'default'}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);
PhoneField.displayName = 'PhoneField';

export { PhoneField }; 