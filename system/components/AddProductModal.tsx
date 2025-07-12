
import React, { useState, useCallback, useEffect } from 'react';
import { XIcon, SpinnerIcon } from './icons';
import { useToast } from '../contexts/ToastProvider';
import { Product } from '../types';

interface AddProductModalProps {
    onClose: () => void;
    onAddProduct: (newProductData: Omit<Product, 'id' | 'status' | 'history'>) => Promise<void>;
    allCategories: string[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddProduct, allCategories }) => {
    const { addToast } = useToast();
    const [name, setName] = useState('');
    const [shelf, setShelf] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedCategory = category.trim();
        if (!trimmedName || !trimmedCategory || isSaving) return;

        setIsSaving(true);
        try {
            await onAddProduct({ 
                name: trimmedName, 
                shelf: shelf.trim(), 
                category: trimmedCategory, 
                quantity, 
                price 
            });
            addToast(`Товар "${trimmedName}" успешно добавлен!`, 'success');
            onClose();
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Не удалось добавить товар.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div
            className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative animate-slideInUp"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                    <XIcon className="w-6 h-6" />
                </button>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Добавить новый товар</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Название товара *</label>
                        <input
                            id="productName"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
                        <input
                            id="productCategory"
                            type="text"
                            list="categories"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                            required
                        />
                        <datalist id="categories">
                            {allCategories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="productShelf" className="block text-sm font-medium text-gray-700 mb-1">Полка</label>
                            <input
                                id="productShelf"
                                type="text"
                                value={shelf}
                                onChange={e => setShelf(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700 mb-1">Начальное количество</label>
                            <input
                                id="productQuantity"
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">Цена (руб.)</label>
                        <input
                            id="productPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || !category.trim() || isSaving}
                            className="flex justify-center items-center w-40 bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-amber-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <SpinnerIcon /> : 'Сохранить товар'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;