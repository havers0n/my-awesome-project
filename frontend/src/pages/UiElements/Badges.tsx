import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Badge } from "@/components/atoms/Badge";
import { ICONS } from '@/helpers/icons';
import { Icon } from '@/components/common/Icon';
import PageMeta from "@/components/common/PageMeta";
import ComponentCard from "@/components/common/ComponentCard";

export default function Badges() {
  return (
    <div>
      <PageMeta
        title="Бейджи | TailAdmin - React.js Admin Dashboard Template"
        description="Страница бейджей для TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Бейджи" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Варианты">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="default">
              Основной
            </Badge>
            <Badge variant="secondary">
              Вторичный
            </Badge>
            <Badge variant="destructive">
              Деструктивный
            </Badge>
            <Badge variant="outline">
              Контурный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="С иконкой">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="default">
              <Icon name="PLUS" size={4} alt="Plus icon" className="mr-1" />
              Основной
            </Badge>
            <Badge variant="secondary">
              <Icon name="PLUS" size={4} alt="Plus icon" className="mr-1" />
              Вторичный
            </Badge>
            <Badge variant="destructive">
              <Icon name="PLUS" size={4} alt="Plus icon" className="mr-1" />
              Деструктивный
            </Badge>
            <Badge variant="outline">
               <Icon name="PLUS" size={4} alt="Plus icon" className="mr-1" />
              Контурный
            </Badge>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
