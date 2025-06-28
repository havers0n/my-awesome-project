import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button/Button";
import { ICONS } from '@/helpers/icons';

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
            <Button size="md" variant="primary">
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
              startIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
              Текст кнопки
            </Button>
            <Button
              size="md"
              variant="primary"
              startIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
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
              endIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
              Текст кнопки
            </Button>
            <Button
              size="md"
              variant="primary"
              endIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
              Текст кнопки
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
            <Button size="md" variant="outline">
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
              startIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
              Текст кнопки
            </Button>
            <Button
              size="md"
              variant="outline"
              startIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
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
              endIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
              Текст кнопки
            </Button>
            <Button
              size="md"
              variant="outline"
              endIcon={<img src={ICONS.BOX} className="size-5" alt="Box icon" />}
            >
              Текст кнопки
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
