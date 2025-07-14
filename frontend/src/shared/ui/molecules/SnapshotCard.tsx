import React from "react";
import { Card } from "@/shared/ui/atoms/Card";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import type { ProductSnapshot } from "@/types/warehouse";

interface SnapshotDataItemProps {
  title: string;
  value: string;
}

const SnapshotDataItem: React.FC<SnapshotDataItemProps> = ({ title, value }) => (
  <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
    <p className="text-xs text-gray-500 font-medium truncate">{title}</p>
    <p className="text-lg font-bold text-gray-800">{value}</p>
  </div>
);

export interface SnapshotCardProps {
  productName?: string;
  snapshot?: ProductSnapshot | null;
  quantity?: number;
  isLoading?: boolean;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({
  productName,
  snapshot,
  quantity,
  isLoading,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[68px]" />
          <Skeleton className="h-[68px]" />
          <Skeleton className="h-[68px]" />
          <Skeleton className="h-[68px]" />
        </div>
      );
    }

    if (snapshot && productName) {
      return (
        <div>
          <h3 className="text-base font-semibold mb-3 truncate">
            {productName}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <SnapshotDataItem 
              title="Средние продажи 7д" 
              value={`${snapshot.avgSales7d.toFixed(1)} шт/день`} 
            />
            <SnapshotDataItem 
              title="Средние продажи 30д" 
              value={`${snapshot.avgSales30d.toFixed(1)} шт/день`} 
            />
            <SnapshotDataItem 
              title="Продажи вчера" 
              value={`${snapshot.salesLag1d} шт`} 
            />
            <SnapshotDataItem 
              title="Текущий остаток" 
              value={`${quantity} шт`} 
            />
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Выберите товар, чтобы увидеть его данные.
        </p>
      </div>
    );
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Снимок товара</h3>
      {renderContent()}
    </Card>
  );
}; 