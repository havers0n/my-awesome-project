import React from 'react';
import PhoneInputLib, {
  type PhoneInputProps as PhoneInputLibProps,
  type Country,
} from 'react-phone-number-input';
import { twMerge } from 'tailwind-merge';
import { cva, type VariantProps } from 'class-variance-authority';
import 'react-phone-number-input/style.css';
import '@/styles/phone-input.css'; 

const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error:
          'border-destructive text-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface PhoneInputProps
  extends Omit<PhoneInputLibProps, 'value'>,
    VariantProps<typeof inputVariants> {
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  defaultCountry?: Country;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      variant,
      value,
      onValueChange,
      defaultCountry = 'RU',
      ...props
    },
    ref,
  ) => {
    return (
      <div className={twMerge(inputVariants({ variant, className }))}>
        <PhoneInputLib
          ref={ref}
          className="PhoneInput"
          inputComponent={React.forwardRef<HTMLInputElement>((props, ref) => (
            <input ref={ref} {...props} className="PhoneInputInput" />
          ))}
          value={value}
          onChange={onValueChange}
          defaultCountry={defaultCountry}
          international
          {...props}
        />
      </div>
    );
  },
);
PhoneInput.displayName = 'PhoneInput';

export { PhoneInput }; 