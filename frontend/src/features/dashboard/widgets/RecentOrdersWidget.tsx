import RecentOrders from "@/components/ecommerce/RecentOrders";
import { WidgetProps } from "../types/dashboard.types";

interface RecentOrdersWidgetProps extends WidgetProps {}

export default function RecentOrdersWidget(_props: RecentOrdersWidgetProps) {
  return <RecentOrders />;
} 