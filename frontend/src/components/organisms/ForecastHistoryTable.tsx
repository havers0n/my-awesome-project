import React from 'react';
import { ForecastHistoryItem } from '../../pages/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../atoms/Card/Card';
import { DataTable, ColumnDef } from '../molecules/DataTable';
import { Pagination } from '../molecules/Pagination';
import { Input } from '../atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../molecules/Select';

interface ForecastHistoryTableProps {
  history: ForecastHistoryItem[];
  historyTotal: number;
  isLoading: boolean;
  searchValue: string;
  categoryValue: string;
  currentPage: number;
  itemsPerPage: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

const columns: ColumnDef<ForecastHistoryItem>[] = [
  {
    accessorKey: 'date',
    header: 'Дата',
    cell: (row) => <div className="text-gray-900">{row.date}</div>,
  },
  {
    accessorKey: 'product',
    header: 'Товар',
    cell: (row) => <div className="font-medium">{row.product}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Категория',
    cell: (row) => <div>{row.category}</div>,
  },
  {
    accessorKey: 'forecast',
    header: 'Прогноз (шт.)',
    cell: (row) => <div>{row.forecast}</div>,
  },
  {
    accessorKey: 'accuracy',
    header: 'Точность',
    cell: (row) => {
      const accuracyColor = {
        'Высокая': 'bg-green-100 text-green-800',
        'Средняя': 'bg-yellow-100 text-yellow-800',
        'Низкая': 'bg-red-100 text-red-800',
      };
      return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${accuracyColor[row.accuracy]}`}>
          {row.accuracy}
        </span>
      );
    },
  },
];

export const ForecastHistoryTable: React.FC<ForecastHistoryTableProps> = ({
  history,
  historyTotal,
  isLoading,
  searchValue,
  categoryValue,
  currentPage,
  itemsPerPage,
  onSearchChange,
  onCategoryChange,
  onPageChange,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>История прогнозов</CardTitle>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Поиск..."
            className="w-48"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Select value={categoryValue} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все категории</SelectItem>
              <SelectItem value="Хлеб">Хлеб</SelectItem>
              <SelectItem value="Выпечка">Выпечка</SelectItem>
              <SelectItem value="Десерты">Десерты</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={history}
          isLoading={isLoading}
          emptyState={<div className="text-center py-10">История прогнозов пуста.</div>}
        />
      </CardContent>
      <CardFooter>
        <Pagination
          currentPage={currentPage}
          totalItems={historyTotal}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}; 