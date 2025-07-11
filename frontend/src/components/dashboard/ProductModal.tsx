
import React from 'react';
import { Product } from '@/types.admin';
import { STATUS_CONFIG, ICONS } from '@/constants';
import { XCircle } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, valueClass?: string, bgClass?: string }> = ({
    icon, label, value, valueClass = 'text-gray-800', bgClass = 'bg-gray-50'
}) => (
    <div className={`${bgClass} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-sm text-gray-600">{label}</span>
        </div>
        <p className={`font-semibold text-lg ${valueClass}`}>{value}</p>
    </div>
);

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const config = STATUS_CONFIG[product.status];
  const handleQuickAction = (action: string) => {
    alert(`Action: ${action} for product: ${product.product_name}. This is a demo.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                        <ICONS.Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800" id="modal-title">{product.product_name}</h3>
                        <p className="text-sm text-gray-600">Detailed Product Information</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
            </div>
            
            <div className="p-6">
                <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 mb-6`}>
                    <div className="flex items-center gap-3">
                        <div className={config.iconColor}>{React.cloneElement(config.icon, {className: "w-6 h-6"})}</div>
                        <div>
                            <span className="text-sm text-gray-600">Status:</span>
                            <p className={`font-semibold ${config.textColor} text-lg`}>{config.text}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={<ICONS.MapPin className="w-4 h-4 text-gray-500"/>} label="Location" value={product.shelf_location}/>
                    <InfoCard icon={<ICONS.CheckCircle className="w-4 h-4 text-green-500"/>} label="Available Stock" value={`${product.available_stock} units`} valueClass="text-green-700" bgClass="bg-green-50"/>
                    <InfoCard icon={<ICONS.Package className="w-4 h-4 text-blue-500"/>} label="Total Stock" value={`${product.total_stock} units`} valueClass="text-blue-700" bgClass="bg-blue-50"/>
                    <InfoCard icon={<ICONS.AlertTriangle className="w-4 h-4 text-yellow-500"/>} label="Reserved Stock" value={`${product.reserved_stock} units`} valueClass="text-yellow-700" bgClass="bg-yellow-50"/>
                    {product.out_of_stock_hours > 0 && (
                        <InfoCard icon={<ICONS.Clock className="w-4 h-4 text-red-500"/>} label="Time Absent" value={`${product.out_of_stock_hours} hours`} valueClass="text-red-700" bgClass="bg-red-50"/>
                    )}
                    <InfoCard icon={<ICONS.Calendar className="w-4 h-4 text-purple-500"/>} label="Last Restock" value={new Date(product.last_restock_date).toLocaleDateString()} valueClass="text-purple-700" bgClass="bg-purple-50"/>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                <button onClick={() => handleQuickAction('Restock')} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mb-3 sm:mb-0">
                    <ICONS.Package className="w-4 h-4" /> Order Restock
                </button>
                <button onClick={() => handleQuickAction('Navigate')} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mb-3 sm:mb-0">
                    <ICONS.MapPin className="w-4 h-4" /> Go to Shelf
                </button>
                <button onClick={onClose} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                    Close
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
