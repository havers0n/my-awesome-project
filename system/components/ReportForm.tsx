import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from '../contexts/ToastProvider';

interface ReportFormProps {
    products: Product[];
    onReportSubmit: (productId: string) => Promise<void>;
}

const ReportForm: React.FC<ReportFormProps> = ({ products, onReportSubmit }) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0,5));

    useEffect(() => {
        if (selectedProductId && !products.find(p => p.id === selectedProductId)) {
            setSelectedProductId('');
        }
    }, [products, selectedProductId]);

    const handleSetNow = () => {
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().slice(0,5));
    }

    const resetForm = () => {
        setSelectedProductId('');
        handleSetNow();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId) return;

        setIsLoading(true);
        try {
            await onReportSubmit(selectedProductId);
            addToast('Отчёт успешно отправлен!', 'success');
            resetForm();
        } catch (error) {
            addToast('Ошибка при отправке отчёта.', 'error');
            console.error("Failed to submit report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Отчёт о недостатке товара</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productSelect">Выберите товар</label>
                    <select 
                        id="productSelect"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        required
                    >
                        <option value="" disabled>-- Выберите товар --</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Дата и время обнаружения</label>
                     <div className="flex items-center gap-2">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600" />
                        <button type="button" onClick={handleSetNow} className="text-sm text-amber-700 font-semibold hover:underline whitespace-nowrap">Сейчас</button>
                     </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expectedDelivery">Ожидаемая поставка</label>
                    <input type="date" id="expectedDelivery" className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-600 focus:border-amber-600" />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !selectedProductId}
                    className="w-full font-bold py-3 px-4 rounded-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl bg-amber-700 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Отправка...' : 'Отправить отчёт'}
                </button>
            </form>
        </div>
    );
};

export default ReportForm;