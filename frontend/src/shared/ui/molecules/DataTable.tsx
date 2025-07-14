import React from "react";
import { Skeleton } from "../atoms/Skeleton";

export interface ColumnDef<T> {
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  accessorKey: keyof T | string; // To be used as a key
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

const LoadingRow: React.FC<{
  columnsCount: number;
}> = ({ columnsCount }) => (
  <tr>
    {Array.from({ length: columnsCount }).map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <Skeleton className="h-6 w-full" />
      </td>
    ))}
  </tr>
);

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyState = (
    <div className="text-center py-8 text-gray-500">Нет данных для отображения</div>
  ),
}: DataTableProps<T>) {
  const columnsCount = columns.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <LoadingRow key={i} columnsCount={columnsCount} />
            ))
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columnsCount} className="text-center py-8">
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 