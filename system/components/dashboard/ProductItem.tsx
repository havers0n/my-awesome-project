
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Product, ProductStatus } from '../../types';

interface ProductItemProps {
    product: Product;
    onSelect: (product: Product) => void;
}

const getStatusClasses = (status: ProductStatus) => {
    switch (status) {
        case ProductStatus.InStock:
            return 'bg-green-100 text-green-800';
        case ProductStatus.LowStock:
            return 'bg-yellow-100 text-yellow-800';
        case ProductStatus.OutOfStock:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onSelect }) => {
    const { t } = useTranslation();
    
    return (
        <tr onClick={() => onSelect(product)} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{product.shelf}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm font-bold text-gray-900">{product.quantity}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(product.status)}`}>
                    {product.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <span className="text-amber-600 hover:text-amber-800">{t('inventory.management.productItem.details')}</span>
            </td>
        </tr>
    );
};

export default ProductItem;
