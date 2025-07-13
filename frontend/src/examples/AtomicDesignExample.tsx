import React from 'react';

// Импорт компонентов согласно новой структуре Atomic Design

// Atoms - базовые строительные блоки
import { Button, Badge, Typography, Icon, Image } from '@/components/atoms';

// Molecules - комбинации атомов
import { ProductCell, ActionBar, TableRowItem, FilterButton } from '@/components/molecules';

// Organisms - группы молекул
import { OrdersTable, OrdersTableHeader } from '@/components/organisms';

// Templates - полные шаблоны страниц
import { RecentOrdersWidget } from '@/components/templates';

// Примеры данных
const sampleOrders = [
  {
    id: 1,
    name: "MacBook Pro 13"",
    variants: "2 Variants",
    category: "Laptop",
    price: "$2399.00",
    status: "Delivered" as const,
    image: "/images/product/product-01.jpg",
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    variants: "1 Variant",
    category: "Watch",
    price: "$879.00",
    status: "Pending" as const,
    image: "/images/product/product-02.jpg",
  },
];

/**
 * Пример использования атомов
 */
const AtomsExample: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      <Typography variant="h2" size="xl" weight="bold">
        Пример использования Atoms
      </Typography>
      
      <div className="flex items-center gap-4">
        <Button variant="primary" size="md">
          Основная кнопка
        </Button>
        <Button variant="outline" size="sm">
          Второстепенная
        </Button>
        <Badge variant="success" color="green">
          Активен
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Image 
          src="/images/product/product-01.jpg" 
          alt="Пример"
          size="md" 
          shape="rounded" 
        />
        <Typography variant="p" size="sm" color="muted">
          Изображение товара
        </Typography>
      </div>
    </div>
  );
};

/**
 * Пример использования молекул
 */
const MoleculesExample: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      <Typography variant="h2" size="xl" weight="bold">
        Пример использования Molecules
      </Typography>

      {/* ProductCell */}
      <ProductCell
        imageUrl="/images/product/product-01.jpg"
        title="MacBook Pro 13""
        description="2 Variants"
        price="$2399.00"
        metadata="В наличии"
        imageSize="md"
        layout="horizontal"
      />

      {/* ActionBar */}
      <ActionBar variant="elevated" align="between" spacing="md">
        <Typography variant="h3" size="lg" weight="semibold">
          Заголовок панели
        </Typography>
        <div className="flex gap-2">
          <FilterButton
            label="Фильтр"
            iconName="filter"
            onClick={() => console.log('Filter clicked')}
            active={false}
          />
          <Button variant="primary" size="sm">
            Действие
          </Button>
        </div>
      </ActionBar>
    </div>
  );
};

/**
 * Пример использования организмов
 */
const OrganismsExample: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      <Typography variant="h2" size="xl" weight="bold">
        Пример использования Organisms
      </Typography>

      {/* OrdersTableHeader */}
      <OrdersTableHeader
        title="Последние заказы"
        subtitle="Управление заказами"
        totalCount={sampleOrders.length}
        showFilter
        showExport
        showViewAll
        onFilterClick={() => console.log('Filter clicked')}
        onExportClick={() => console.log('Export clicked')}
        onViewAllClick={() => console.log('View all clicked')}
      />

      {/* OrdersTable */}
      <OrdersTable
        orders={sampleOrders}
        showCheckboxes
        onRowClick={(order) => console.log('Order clicked:', order)}
      />
    </div>
  );
};

/**
 * Пример использования шаблонов
 */
const TemplatesExample: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      <Typography variant="h2" size="xl" weight="bold">
        Пример использования Templates
      </Typography>

      {/* RecentOrdersWidget - полноценный виджет */}
      <RecentOrdersWidget
        orders={sampleOrders}
        title="Последние заказы"
        subtitle="Обзор недавних транзакций"
        showCheckboxes={false}
        showFilter={true}
        showExport={true}
        showViewAll={true}
        maxItems={5}
        onOrderClick={(order) => console.log('Order clicked:', order)}
        onFilterClick={() => console.log('Filter clicked')}
        onViewAllClick={() => console.log('View all clicked')}
        onExportClick={() => console.log('Export clicked')}
      />
    </div>
  );
};

/**
 * Главный компонент демонстрации Atomic Design
 */
const AtomicDesignExample: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <Typography variant="h1" size="3xl" weight="bold" className="mb-4">
          Демонстрация Atomic Design
        </Typography>
        <Typography variant="p" size="lg" color="secondary">
          Примеры использования компонентов на всех уровнях иерархии
        </Typography>
      </div>

      <AtomsExample />
      <MoleculesExample />
      <OrganismsExample />
      <TemplatesExample />

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <Typography variant="h3" size="lg" weight="semibold" className="mb-4">
          Принципы композиции
        </Typography>
        <div className="space-y-2">
          <Typography variant="p" size="sm" color="muted">
            • <strong>Atoms</strong> — базовые элементы (кнопки, иконки, текст)
          </Typography>
          <Typography variant="p" size="sm" color="muted">
            • <strong>Molecules</strong> — комбинации атомов (карточки товаров, панели действий)
          </Typography>
          <Typography variant="p" size="sm" color="muted">
            • <strong>Organisms</strong> — группы молекул (таблицы, заголовки с действиями)
          </Typography>
          <Typography variant="p" size="sm" color="muted">
            • <strong>Templates</strong> — полные шаблоны страниц и виджетов
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AtomicDesignExample;
