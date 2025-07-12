import DemographicCard from "@/components/ecommerce/DemographicCard";
import { WidgetProps } from "../types/dashboard.types";

interface DemographicCardWidgetProps extends WidgetProps {}

export default function DemographicCardWidget(_props: DemographicCardWidgetProps) {
  return <DemographicCard />;
} 