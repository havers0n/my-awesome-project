import React from 'react';
import { Button } from '../atoms/Button';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page
  }

  const handlePrevious = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex items-center justify-between text-sm text-gray-600 ${className}`}>
      <div>
        Показано {startItem}-{endItem} из {totalItems} записей
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Назад
        </Button>
        <span className="font-medium">
          Страница {currentPage} из {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Вперед
        </Button>
      </div>
    </div>
  );
}; 