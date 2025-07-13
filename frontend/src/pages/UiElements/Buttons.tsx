import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/atoms/Button";
import { ICONS } from '@/helpers/icons';
import { Icon } from '@/components/common/Icon';

export default function Buttons() {
  return (
    <div>
      <PageMeta
        title="Кнопки | TailAdmin - React.js Admin Dashboard Template"
        description="Страница кнопок для TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Кнопки" />
      <div className="space-y-5 sm:space-y-6">
        {/* Primary Button */}
        <ComponentCard title="Primary Button">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary">
              Текст кнопки
            </Button>
            <Button size="default" variant="primary">
              Текст кнопки
            </Button>
          </div>
        </ComponentCard>
        {/* Primary Button with Start Icon */}
        <ComponentCard title="Primary Button with Left Icon">
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="primary"
            >
              <Icon name="BOX" size={5} alt="Box icon" className="mr-2" />
              Текст кнопки
            </Button>
            <Button
              size="default"
              variant="primary"
            >
              <Icon name="BOX" size={5} alt="Box icon" className="mr-2" />
              Текст кнопки
            </Button>
          </div>
        </ComponentCard>
        {/* Primary Button with Start Icon */}
        <ComponentCard title="Primary Button with Right Icon">
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="primary"
            >
              Текст кнопки
              <Icon name="BOX" size={5} alt="Box icon" className="ml-2" />
            </Button>
            <Button
              size="default"
              variant="primary"
            >
              Текст кнопки
              <Icon name="BOX" size={5} alt="Box icon" className="ml-2" />
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button */}
        <ComponentCard title="Secondary Button">
          <div className="flex items-center gap-5">
            {/* Outline Button */}
            <Button size="sm" variant="outline">
              Текст кнопки
            </Button>
            <Button size="default" variant="outline">
              Текст кнопки
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button with Start Icon */}
        <ComponentCard title="Outline Button with Left Icon">
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="outline"
            >
              <Icon name="BOX" size={5} alt="Box icon" className="mr-2" />
              Текст кнопки
            </Button>
            <Button
              size="default"
              variant="outline"
            >
              <Icon name="BOX" size={5} alt="Box icon" className="mr-2" />
              Текст кнопки
            </Button>
          </div>
        </ComponentCard>{" "}
        {/* Outline Button with Start Icon */}
        <ComponentCard title="Outline Button with Right Icon">
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="outline"
            >
              Текст кнопки
              <Icon name="BOX" size={5} alt="Box icon" className="ml-2" />
            </Button>
            <Button
              size="default"
              variant="outline"
            >
              Текст кнопки
              <Icon name="BOX" size={5} alt="Box icon" className="ml-2" />
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
