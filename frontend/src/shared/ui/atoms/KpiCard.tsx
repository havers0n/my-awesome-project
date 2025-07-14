import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const changeVariants = cva('flex items-center text-xs font-medium', {
  variants: {
    changeType: {
      positive: 'text-green-600',
      negative: 'text-red-600',
    },
  },
});

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  change?: string;
  changeType?: VariantProps<typeof changeVariants>['changeType'];
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, changeType, className, ...props }) => {
  return (
    <div className={cn('bg-white p-4 rounded-lg border border-gray-200 shadow-sm', className)} {...props}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && changeType && (
          <div className={changeVariants({ changeType })}>
            {changeType === 'positive' && <ArrowUp className="h-4 w-4" />}
            {changeType === 'negative' && <ArrowDown className="h-4 w-4" />}
            <span className="ml-1">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { KpiCard }; 
export default KpiCard;