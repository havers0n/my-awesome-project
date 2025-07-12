import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import { WidgetProps } from "../types/dashboard.types";

interface EcommerceMetricsWidgetProps extends WidgetProps {}

export default function EcommerceMetricsWidget(props: EcommerceMetricsWidgetProps) {
  console.log('💼 [EcommerceMetricsWidget] Rendering with props:', props);
  
  return (
    <div className="h-full w-full">
      <EcommerceMetrics />
    </div>
  );
} 