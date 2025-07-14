import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  'px-2 py-1 text-xs font-semibold rounded-md inline-block',
  {
    variants: {
      accuracy: {
        Высокая: 'bg-green-100 text-green-800',
        Средняя: 'bg-yellow-100 text-yellow-800',
        Низкая: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      accuracy: 'Средняя',
    },
  }
);

export interface AccuracyBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  accuracy: 'Высокая' | 'Средняя' | 'Низкая';
}

const AccuracyBadge: React.FC<AccuracyBadgeProps> = ({
  className,
  accuracy,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ accuracy }), className)} {...props}>
      {accuracy}
    </span>
  );
};

export { AccuracyBadge, badgeVariants }; 
export default AccuracyBadge;