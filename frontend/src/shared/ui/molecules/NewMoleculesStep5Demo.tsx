import React, { useState } from "react";
import { Card } from "../atoms";
import {
  ProductCell,
  ActionBar,
  TableRowItem,
  TableCell,
  FilterButton,
  FilterGroup,
} from "./index";

const NewMoleculesStep5Demo: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const handleRowSelection = (rowId: string, checked: boolean) => {
    setSelectedRows(prev => (checked ? [...prev, rowId] : prev.filter(id => id !== rowId)));
  };

  const sampleProducts = [
    {
      id: '1',
      imageUrl: '/images/product/product-01.jpg',
      title: 'Смартфон iPhone 14',
      description: 'Новейший смартфон Apple с улучшенной камерой',
      price: '$899',
      metadata: 'В наличии: 25 шт.',
    },
    {
      id: '2',
      imageUrl: '/images/product/product-02.jpg',
      title: 'Ноутбук MacBook Pro',
      description: 'Профессиональный ноутбук для разработчиков',
      price: '$1,299',
      metadata: 'В наличии: 12 шт.',
    },
    {
      id: '3',
      imageUrl: '/images/product/product-03.jpg',
      title: 'Наушники AirPods Pro',
      description: 'Беспроводные наушники с шумоподавлением',
      price: '$249',
      metadata: 'В наличии: 45 шт.',
    },
  ];

  const filterOptions = [
    {
      id: 'all',
      label: 'Все товары',
      iconName: 'GRID' as const,
      active: selectedFilters.includes('all'),
      count: 156,
    },
    {
      id: 'electronics',
      label: 'Электроника',
      iconName: 'BOLT' as const,
      active: selectedFilters.includes('electronics'),
      count: 89,
    },
    {
      id: 'clothing',
      label: 'Одежда',
      iconName: 'BOX' as const,
      active: selectedFilters.includes('clothing'),
      count: 67,
    },
    {
      id: 'books',
      label: 'Книги',
      iconName: 'DOCS' as const,
      active: selectedFilters.includes('books'),
      count: 34,
    },
    {
      id: 'sale',
      label: 'Распродажа',
      iconName: 'SHOOTING_STAR' as const,
      active: selectedFilters.includes('sale'),
      count: 23,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Новые Molecules - Шаг 5
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Демонстрация новых составных компонентов: ProductCell, ActionBar, TableRowItem,
          FilterButton
        </p>
      </div>

      {/* ProductCell Demo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          ProductCell - Ячейка товара
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Горизонтальное размещение
            </h3>
            <div className="space-y-4">
              {sampleProducts.map(product => (
                <ProductCell
                  key={product.id}
                  imageUrl={product.imageUrl}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  metadata={product.metadata}
                  layout="horizontal"
                  imageSize="md"
                  onClick={() => console.log('Product clicked:', product.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Вертикальное размещение
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {sampleProducts.slice(0, 2).map(product => (
                <ProductCell
                  key={`vertical-${product.id}`}
                  imageUrl={product.imageUrl}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  layout="vertical"
                  imageSize="lg"
                  onClick={() => console.log('Product clicked:', product.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* FilterButton Demo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          FilterButton - Кнопки фильтрации
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Отдельные кнопки
            </h3>
            <div className="flex flex-wrap gap-3">
              <FilterButton
                label="Активные"
                iconName="CHECK_CIRCLE"
                active={true}
                count={5}
                onClick={() => console.log('Active filter clicked')}
              />
              <FilterButton
                label="Ожидающие"
                iconName="TIME"
                count={12}
                onClick={() => console.log('Pending filter clicked')}
              />
              <FilterButton
                label="Завершенные"
                iconName="CHECK_LINE"
                variant="outlined"
                onClick={() => console.log('Completed filter clicked')}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Группа фильтров
            </h3>
            <FilterGroup
              title="Категории товаров"
              filters={filterOptions}
              onFilterChange={handleFilterChange}
              variant="default"
              orientation="horizontal"
              multiple={true}
            />
          </div>
        </div>
      </Card>

      {/* ActionBar Demo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          ActionBar - Панель действий
        </h2>

        <div className="space-y-4">
          <ActionBar
            title="Управление товарами"
            description="Выберите действия для работы с товарами"
            align="between"
            variant="default"
            showDivider={true}
          >
            <FilterButton
              label="Фильтр"
              iconName="GRID"
              onClick={() => console.log('Filter clicked')}
            />
            <FilterButton
              label="Сортировка"
              iconName="LIST"
              onClick={() => console.log('Sort clicked')}
            />
            <FilterButton
              label="Экспорт"
              iconName="DOWNLOAD"
              onClick={() => console.log('Export clicked')}
            />
          </ActionBar>

          <ActionBar align="right" variant="elevated" spacing="sm">
            <FilterButton
              label="Добавить"
              iconName="PLUS"
              variant="filled"
              onClick={() => console.log('Add clicked')}
            />
            <FilterButton
              label="Удалить"
              iconName="TRASH"
              onClick={() => console.log('Delete clicked')}
            />
          </ActionBar>
        </div>
      </Card>

      {/* TableRowItem Demo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          TableRowItem - Строки таблицы
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <TableCell isHeader padding="md">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRows(sampleProducts.map(p => p.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell isHeader>Товар</TableCell>
                <TableCell isHeader>Цена</TableCell>
                <TableCell isHeader>Статус</TableCell>
                <TableCell isHeader>Действия</TableCell>
              </tr>
            </thead>
            <tbody>
              {sampleProducts.map((product, index) => (
                <TableRowItem
                  key={product.id}
                  onClick={() => console.log('Row clicked:', product.id)}
                  selected={selectedRows.includes(product.id)}
                  hoverable={true}
                  status={index === 1 ? 'warning' : 'normal'}
                  showCheckbox={true}
                  checked={selectedRows.includes(product.id)}
                  onCheckedChange={checked => handleRowSelection(product.id, checked)}
                >
                  <TableCell>
                    <ProductCell
                      imageUrl={product.imageUrl}
                      title={product.title}
                      description={product.description}
                      imageSize="sm"
                      layout="horizontal"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {product.price}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        index === 1
                          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300'
                          : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                      }`}
                    >
                      {index === 1 ? 'Заканчивается' : 'В наличии'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FilterButton
                        label="Редактировать"
                        iconName="PENCIL"
                        size="sm"
                        onClick={() => console.log('Edit clicked:', product.id)}
                      />
                      <FilterButton
                        label="Удалить"
                        iconName="TRASH"
                        size="sm"
                        onClick={() => console.log('Delete clicked:', product.id)}
                      />
                    </div>
                  </TableCell>
                </TableRowItem>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default NewMoleculesStep5Demo;
