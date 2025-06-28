import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
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
        <ComponentCard title="На светлом фоне">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            {/* Light Variant */}
            <Badge variant="light" color="primary">
              Основной
            </Badge>
            <Badge variant="light" color="success">
              Успех
            </Badge>{" "}
            <Badge variant="light" color="error">
              Ошибка
            </Badge>{" "}
            <Badge variant="light" color="warning">
              Внимание
            </Badge>{" "}
            <Badge variant="light" color="info">
              Инфо
            </Badge>
            <Badge variant="light" color="light">
              Светлый
            </Badge>
            <Badge variant="light" color="dark">
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="На сплошном фоне">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            {/* Light Variant */}
            <Badge variant="solid" color="primary">
              Основной
            </Badge>
            <Badge variant="solid" color="success">
              Успех
            </Badge>{" "}
            <Badge variant="solid" color="error">
              Ошибка
            </Badge>{" "}
            <Badge variant="solid" color="warning">
              Внимание
            </Badge>{" "}
            <Badge variant="solid" color="info">
              Инфо
            </Badge>
            <Badge variant="solid" color="light">
              Светлый
            </Badge>
            <Badge variant="solid" color="dark">
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Светлый фон с иконкой слева">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="light" color="primary" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Основной
            </Badge>
            <Badge variant="light" color="success" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Успех
            </Badge>{" "}
            <Badge variant="light" color="error" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Ошибка
            </Badge>{" "}
            <Badge variant="light" color="warning" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Внимание
            </Badge>{" "}
            <Badge variant="light" color="info" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Инфо
            </Badge>
            <Badge variant="light" color="light" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Светлый
            </Badge>
            <Badge variant="light" color="dark" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Сплошной фон с иконкой слева">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Основной
            </Badge>
            <Badge variant="solid" color="success" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Успех
            </Badge>{" "}
            <Badge variant="solid" color="error" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Ошибка
            </Badge>{" "}
            <Badge variant="solid" color="warning" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Внимание
            </Badge>{" "}
            <Badge variant="solid" color="info" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Инфо
            </Badge>
            <Badge variant="solid" color="light" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Светлый
            </Badge>
            <Badge variant="solid" color="dark" startIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Сплошной фон с иконкой справа">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Основной
            </Badge>
            <Badge variant="solid" color="success" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Успех
            </Badge>{" "}
            <Badge variant="solid" color="error" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Ошибка
            </Badge>{" "}
            <Badge variant="solid" color="warning" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Внимание
            </Badge>{" "}
            <Badge variant="solid" color="info" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Инфо
            </Badge>
            <Badge variant="solid" color="light" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Светлый
            </Badge>
            <Badge variant="solid" color="dark" endIcon={<Icon name="PLUS" size={4} alt="Plus icon" />}>
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
