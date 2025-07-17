
import { Header } from "@/components/header";
import { HostingSidebar } from "@/components/hosting-sidebar";
import { ServiceCard } from "@/components/service-card";

export default function Dashboard() {
  const services = [
    {
      title: "Виртуальный сервер",
      description: "Гибкие конфигурации от 1 до 32 ядер",
      price: "от 199 ₽/мес",
      features: ["SSD диски", "1-32 ядра CPU", "До 64 ГБ RAM", "Почасовая оплата"],
      isPopular: true,
    },
    {
      title: "Hi-CPU сервер",
      description: "Высокопроизводительные процессоры",
      price: "от 599 ₽/мес",
      features: ["Топовые CPU", "Высокая частота", "SSD NVMe", "Оптимизация"],
    },
    {
      title: "Выделенный сервер",
      description: "Полный контроль и максимальная производительность",
      price: "от 4999 ₽/мес",
      features: ["Физический сервер", "Полный root", "Без соседей", "24/7 поддержка"],
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <HostingSidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Создать новую услугу
              </h1>
              <p className="text-muted-foreground">
                Выберите подходящее решение для вашего проекта
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
