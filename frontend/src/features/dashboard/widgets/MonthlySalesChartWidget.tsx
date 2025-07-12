import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import { WidgetProps } from "../types/dashboard.types";

interface MonthlySalesChartWidgetProps extends WidgetProps {}

export default function MonthlySalesChartWidget(_props: MonthlySalesChartWidgetProps) {
  return <MonthlySalesChart />;
} 