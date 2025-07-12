import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import { WidgetProps } from "../types/dashboard.types";

interface StatisticsChartWidgetProps extends WidgetProps {}

export default function StatisticsChartWidget(_props: StatisticsChartWidgetProps) {
  return <StatisticsChart />;
} 