import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { PlusIcon } from "../../icons";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

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
            <Badge variant="light" color="primary" startIcon={<PlusIcon />}>
              Основной
            </Badge>
            <Badge variant="light" color="success" startIcon={<PlusIcon />}>
              Успех
            </Badge>{" "}
            <Badge variant="light" color="error" startIcon={<PlusIcon />}>
              Ошибка
            </Badge>{" "}
            <Badge variant="light" color="warning" startIcon={<PlusIcon />}>
              Внимание
            </Badge>{" "}
            <Badge variant="light" color="info" startIcon={<PlusIcon />}>
              Инфо
            </Badge>
            <Badge variant="light" color="light" startIcon={<PlusIcon />}>
              Светлый
            </Badge>
            <Badge variant="light" color="dark" startIcon={<PlusIcon />}>
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Сплошной фон с иконкой слева">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" startIcon={<PlusIcon />}>
              Основной
            </Badge>
            <Badge variant="solid" color="success" startIcon={<PlusIcon />}>
              Успех
            </Badge>{" "}
            <Badge variant="solid" color="error" startIcon={<PlusIcon />}>
              Ошибка
            </Badge>{" "}
            <Badge variant="solid" color="warning" startIcon={<PlusIcon />}>
              Внимание
            </Badge>{" "}
            <Badge variant="solid" color="info" startIcon={<PlusIcon />}>
              Инфо
            </Badge>
            <Badge variant="solid" color="light" startIcon={<PlusIcon />}>
              Светлый
            </Badge>
            <Badge variant="solid" color="dark" startIcon={<PlusIcon />}>
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title="Сплошной фон с иконкой справа">
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" endIcon={<PlusIcon />}>
              Основной
            </Badge>
            <Badge variant="solid" color="success" endIcon={<PlusIcon />}>
              Успех
            </Badge>{" "}
            <Badge variant="solid" color="error" endIcon={<PlusIcon />}>
              Ошибка
            </Badge>{" "}
            <Badge variant="solid" color="warning" endIcon={<PlusIcon />}>
              Внимание
            </Badge>{" "}
            <Badge variant="solid" color="info" endIcon={<PlusIcon />}>
              Инфо
            </Badge>
            <Badge variant="solid" color="light" endIcon={<PlusIcon />}>
              Светлый
            </Badge>
            <Badge variant="solid" color="dark" endIcon={<PlusIcon />}>
              Тёмный
            </Badge>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
