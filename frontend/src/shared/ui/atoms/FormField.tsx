import React from "react";
import { ReactNode } from "react";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  children,
  className = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p
          className={`text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          className={`text-sm text-gray-500 dark:text-gray-400 ${helperClassName}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}; 