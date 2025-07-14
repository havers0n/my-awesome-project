import React, { useState, useEffect, useCallback } from 'react';
import { Product, HistoryEntry } from '../types';
import { EditIcon, CheckIcon, XIcon, TrashIcon, SpinnerIcon } from './icons';
import { useToast } from '../contexts/ToastProvider';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    onQuantityChange: (productId: string, newQuantity: number, type: HistoryEntry['type']) => Promise<void>;
    onUpdate: (productId: string, updates: Partial<Pick<Product, 'name' | 'shelf' | 'price'>>) => Promise<void>;
    onDelete: (productId: string) => Promise<void>;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onQuantityChange, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [localName, setLocalName] = useState(product.name);
    const [localShelf, setLocalShelf] = useState(product.shelf);
    const [localQuantity, setLocalQuantity] = useState(product.quantity);
    const [localPrice, setLocalPrice] = useState(product.price || 0);
    const { addToast } = useToast();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises: Promise<void>[] = [];
            let changed = false;

            if (localQuantity !== product.quantity) {
                promises.push(onQuantityChange(product.id, localQuantity, 'Коррекция'));
                changed = true;
            }

            const detailUpdates: Partial<Pick<Product, 'name' | 'shelf' | 'price'>> = {};
            if (localName !== product.name) detailUpdates.name = localName;
            if (localShelf !== product.shelf) detailUpdates.shelf = localShelf;
            if (localPrice !== product.price) detailUpdates.price = localPrice;

            if (Object.keys(detailUpdates).length > 0) {
                promises.push(onUpdate(product.id, detailUpdates));
                changed = true;
            }

            await Promise.all(promises);
            
            if (changed) {
                addToast('Товар успешно обновлен!', 'success');
            }
            setIsEditing(false);
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Не удалось сохранить изменения.', 'error');
            // Revert changes on error
            setLocalName(product.name);
            setLocalShelf(product.shelf);
            setLocalQuantity(product.quantity);
            setLocalPrice(product.price || 0);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить товар "${product.name}"? Это действие необратимо.`)) {
            setIsDeleting(true);
            try {
                await onDelete(product.id);
                addToast(`Товар "${product.name}" удален.`, 'success');
                onClose();
            } catch (error) {
                 addToast(error instanceof Error ? error.message : 'Не удалось удалить товар.', 'error');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleCancel = () => {
        setLocalName(product.name);
        setLocalShelf(product.shelf);
        setLocalQuantity(product.quantity);
        setLocalPrice(product.price || 0);
        setIsEditing(false);
    };

    const handleQuantityStep = (amount: number) => {
        setLocalQuantity(prev => Math.max(0, prev + amount));
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative animate-slideInUp"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                    <XIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-2xl font-bold text-gray-800">{isEditing ? 'Редактирование' : 'Детали товара'}</h3>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={isSaving} className="p-2 w-10 h-10 flex items-center justify-center text-green-600 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50">
                                {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <CheckIcon />}
                            </button>
                            <button onClick={handleCancel} disabled={isSaving} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50"><XIcon className="w-5 h-5"/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:underline">
                                <EditIcon className="w-4 h-4" />
                                Редактировать
                            </button>
                            <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 text-sm font-semibold text-red-700 hover:underline disabled:opacity-50">
                                {isDeleting ? <SpinnerIcon className="w-4 h-4" /> : <TrashIcon className="w-4 h-4" />}
                                {isDeleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mb-6">
                    <div className="md:col-span-1">
                        <label className="text-xs text-gray-400">Название</label>
                        {isEditing ? (
                            <input type="text" value={localName} onChange={e => setLocalName(e.target.value)} className="w-full text-lg font-semibold p-1 -ml-1 border-2 border-amber-600 rounded-md"/>
                        ) : (
                            <p className="text-lg font-semibold text-gray-800 truncate">{localName}</p>
                        )}
                    </div>
                     <div className="md:col-span-1">
                        <label className="text-xs text-gray-400">Полка</label>
                         {isEditing ? (
                            <input type="text" value={localShelf} onChange={e => setLocalShelf(e.target.value)} className="w-full text-lg font-semibold p-1 -ml-1 border-2 border-amber-600 rounded-md"/>
                        ) : (
                            <p className="text-lg font-semibold text-gray-800">{localShelf}</p>
                        )}
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-xs text-gray-400">Цена (руб.)</label>
                         {isEditing ? (
                            <input type="number" value={localPrice} onChange={e => setLocalPrice(parseFloat(e.target.value) || 0)} className="w-full text-lg font-semibold p-1 -ml-1 border-2 border-amber-600 rounded-md"/>
                        ) : (
                            <p className="text-lg font-semibold text-gray-800">{localPrice.toLocaleString('ru-RU')}</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 mb-2 block text-center">Текущий остаток</label>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleQuantityStep(-1)} disabled={!isEditing} className="font-bold text-2xl bg-amber-100 text-amber-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                        <span className="text-5xl font-bold text-amber-700 min-w-[80px] text-center">{localQuantity}</span>
                        <button onClick={() => handleQuantityStep(1)} disabled={!isEditing} className="font-bold text-2xl bg-amber-100 text-amber-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                    </div>
                     {isEditing && localQuantity !== product.quantity && <p className="text-center text-xs text-amber-700 mt-2">Нажмите &quot;Сохранить&quot;, чтобы применить изменения</p>}
                </div>

                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">История движения</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 border-l-2 border-gray-100 pl-4">
                        {product.history.length > 0 ? [...product.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                            <div key={entry.id} className="text-xs p-2 rounded-md bg-gray-50 flex justify-between items-center hover:bg-gray-100">
                                <div>
                                    <span className="font-semibold">{entry.type}</span>
                                    <span className="text-gray-500 ml-2">{new Date(entry.date).toLocaleString('ru-RU')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className={`font-bold ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.change > 0 ? `+${entry.change}` : entry.change}
                                     </span>
                                     <span className="text-gray-500 font-mono text-right w-10">→ {entry.newQuantity}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-xs text-gray-500">История операций отсутствует.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;