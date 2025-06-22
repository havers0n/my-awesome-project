import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import PageMeta from "@/components/common/PageMeta";

export default function Alerts() {
  return (
    <>
      <PageMeta
        title="Оповещения | TailAdmin - React.js Admin Dashboard Template"
        description="Страница оповещений для TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Оповещения" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Успешное оповещение">
          <Alert
            variant="success"
            title="Успешно"
            message="Будьте осторожны при выполнении этого действия."
            showLink={true}
            linkHref="/"
            linkText="Подробнее"
          />
          <Alert
            variant="success"
            title="Успешно"
            message="Будьте осторожны при выполнении этого действия."
            showLink={false}
          />
        </ComponentCard>
        <ComponentCard title="Оповещение о предупреждении">
          <Alert
            variant="warning"
            title="Внимание"
            message="Будьте осторожны при выполнении этого действия."
            showLink={true}
            linkHref="/"
            linkText="Подробнее"
          />
          <Alert
            variant="warning"
            title="Внимание"
            message="Будьте осторожны при выполнении этого действия."
            showLink={false}
          />
        </ComponentCard>{" "}
        <ComponentCard title="Ошибка">
          <Alert
            variant="error"
            title="Ошибка"
            message="Будьте осторожны при выполнении этого действия."
            showLink={true}
            linkHref="/"
            linkText="Подробнее"
          />
          <Alert
            variant="error"
            title="Ошибка"
            message="Будьте осторожны при выполнении этого действия."
            showLink={false}
          />
        </ComponentCard>{" "}
        <ComponentCard title="Информация">
          <Alert
            variant="info"
            title="Информация"
            message="Будьте осторожны при выполнении этого действия."
            showLink={true}
            linkHref="/"
            linkText="Подробнее"
          />
          <Alert
            variant="info"
            title="Информация"
            message="Будьте осторожны при выполнении этого действия."
            showLink={false}
          />
        </ComponentCard>
      </div>
    </>
  );
}
