
import React, { useState, useRef } from 'react';
import { OutOfStockItem } from '@/types.admin';
import { ICONS } from '@/constants';
import { Card, CardHeader, CardContent } from './Card';
import { Plus, Trash2 } from 'lucide-react';

interface OutOfStockTrackerProps {
  items: OutOfStockItem[];
  onAddItem: (item: Omit<OutOfStockItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

const OutOfStockTracker: React.FC<OutOfStockTrackerProps> = ({ items, onAddItem, onDeleteItem }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [product, setProduct] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  const handleMinutesChange = (val: string) => {
    let v = val.replace(/[^0-9]/g, "").slice(0, 2);
    if (v && Number(v) > 59) v = "59";
    setMinutes(v);
  };

  const handleHoursChange = (val: string) => {
    let v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setHours(v);
    if (v.length === 2 && minutesRef.current) {
      minutesRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const h = Number(hours);
    const m = minutes === "" ? 0 : Number(minutes);
    if (!product.trim() || isNaN(h) || isNaN(m) || h < 0 || m < 0 || m > 59) {
      setError("Please enter a valid product name, hours, and minutes (0-59).");
      return;
    }
    onAddItem({ date, product_name: product.trim(), hours: h, minutes: m });
    setProduct('');
    setHours('');
    setMinutes('');
  };

  return (
    <Card>
      <CardHeader className="bg-red-50">
        <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
                <ICONS.Timer className="w-5 h-5 text-red-600" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-800">Out-of-Stock Tracker</h3>
                <p className="text-sm text-gray-600">Log time products are missing from shelves</p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"/>
              <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product Name" className="lg:col-span-2 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"/>
              <div className="flex gap-2">
                <input type="text" value={hours} onChange={(e) => handleHoursChange(e.target.value)} placeholder="H" className="w-1/2 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-center" />
                <input ref={minutesRef} type="text" value={minutes} onChange={(e) => handleMinutesChange(e.target.value)} placeholder="M" className="w-1/2 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"/>
              </div>
              <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </form>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"><ICONS.Calendar className="inline w-4 h-4 mr-1"/>Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"><ICONS.Package className="inline w-4 h-4 mr-1"/>Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"><ICONS.Clock className="inline w-4 h-4 mr-1"/>Time Absent</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                      <ICONS.Clock className="w-3 h-3"/>{item.hours}h {item.minutes.toString().padStart(2, "0")}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No out-of-stock items logged.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutOfStockTracker;
