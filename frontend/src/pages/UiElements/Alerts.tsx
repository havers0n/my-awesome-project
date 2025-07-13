import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/molecules/Alert";
import PageMeta from "@/components/common/PageMeta";
import { Terminal } from "lucide-react";
import { Link } from "react-router-dom";

export default function Alerts() {
  return (
    <>
      <PageMeta
        title="Оповещения | TailAdmin - React.js Admin Dashboard Template"
        description="Страница оповещений для TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Оповещения" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Стандартное оповещение">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
        </ComponentCard>
        <ComponentCard title="Оповещение об успехе">
           <Alert variant="default" className="text-green-600 border-green-200">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Успешно</AlertTitle>
            <AlertDescription>
              Будьте осторожны при выполнении этого действия.
              <Link to="/" className="font-bold underline ml-2">Подробнее</Link>
            </AlertDescription>
          </Alert>
        </ComponentCard>
        <ComponentCard title="Оповещение о предупреждении">
           <Alert variant="default" className="text-yellow-600 border-yellow-200">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Внимание</AlertTitle>
            <AlertDescription>
              Будьте осторожны при выполнении этого действия.
            </AlertDescription>
          </Alert>
        </ComponentCard>
        <ComponentCard title="Оповещение об ошибке">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>
              Будьте осторожны при выполнении этого действия.
            </AlertDescription>
          </Alert>
        </ComponentCard>
      </div>
    </>
  );
}
