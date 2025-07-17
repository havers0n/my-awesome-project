
import { HostingSidebar } from "@/components/hosting-sidebar"
import { ServiceCard } from "@/components/service-card"
import { Header } from "@/components/header"

const Index = () => {
  const services = [
    {
      title: "Виртуальный сервер",
      description: "Масштабируемые облачные серверы для любых задач",
      price: "от 199 ₽/мес",
      features: ["SSD диски", "1-8 ядер CPU", "До 32 ГБ RAM", "Почасовая оплата"],
    },
    {
      title: "Hi-CPU сервер", 
      description: "Высокопроизводительные серверы для вычислений",
      price: "от 599 ₽/мес",
      features: ["Топовые CPU", "Высокая частота", "SSD NVMe", "Оптимизация"],
      isPopular: true
    },
    {
      title: "Выделенный сервер",
      description: "Физические серверы с полным контролем",
      price: "от 4999 ₽/мес",
      features: ["Физический сервер", "Полный root", "Без соседей", "24/7 поддержка"],
    },
    {
      title: "Домен",
      description: "Регистрация и управление доменными именами",
      price: "от 99 ₽/год",
      features: ["Регистрация домена", "DNS управление", "Whois защита", "Автопродление"],
    }
  ]

  return (
    <div className="flex h-screen bg-background">
      <HostingSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Доступные услуги
              </h1>
              <p className="text-muted-foreground">
                Выберите подходящее решение для ваших задач
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  features={service.features}
                  isPopular={service.isPopular}
                />
              ))}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border bg-background/95 backdrop-blur px-6 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>~97,5% ★ Рейтинг удовлетворенности поддержкой пользователей</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Написать</span>
              <span>8 800 200-60-13</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
