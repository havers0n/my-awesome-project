import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import { WidgetProps } from "../types/dashboard.types";

interface MonthlyTargetWidgetProps extends WidgetProps {}

export default function MonthlyTargetWidget(_props: MonthlyTargetWidgetProps) {
  return <MonthlyTarget />;
} 