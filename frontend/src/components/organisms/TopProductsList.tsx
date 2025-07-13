import React from 'react';
import { TopProduct } from '../../pages/types';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card/Card';
import { Skeleton } from '../atoms/Skeleton';

interface TopProductsListProps {
  topProducts: TopProduct[];
  loading: boolean;
}

const ProductItem: React.FC<{ item: TopProduct; index: number }> = ({ item, index }) => (
  <div className={`top-product-item animate-fadeIn hover:bg-gray-50 p-2 rounded transition-all duration-200 stagger-${index + 1}`} key={item.name}>
    <div className="flex justify-between mb-1">
      <span className="font-medium">{item.name}</span>
      <span className="font-semibold text-indigo-600">{item.amount} шт</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full progress-bar ${item.colorClass}`}
        style={{ width: item.barWidth }}
      />
    </div>
  </div>
);

const TopProductsList: React.FC<TopProductsListProps> = ({ topProducts, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift animate-slideUp stagger-1">
      <CardHeader>
        <CardTitle>Топ продуктов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <div className="text-gray-400">Нет данных</div>
          ) : (
            topProducts.map((item, idx) => (
              <ProductItem key={item.name} item={item} index={idx} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsList; 