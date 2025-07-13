import React, { useState, useEffect, useRef } from "react";
import { outOfStockService } from "@/services/outOfStockService";
import { supabase } from "@/services/supabaseClient";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import { Button } from "@/components/atoms/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/molecules/Alert";
import Label from "@/components/form/Label";

export default function OutOfStockTracker() {
  const [userId, setUserId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [product, setProduct] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  // Получить user_id текущего пользователя
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id || null);
    })();
  }, []);

  // Загрузить записи для пользователя и даты
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    outOfStockService
      .getRecords({ userId, date })
      .then(setItems)
      .catch(() => setError("Ошибка загрузки данных"))
      .finally(() => setLoading(false));
  }, [userId, date]);

  // Ограничение для минут
  const handleMinutesChange = (val: string) => {
    let v = val.replace(/[^0-9]/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    if (v && Number(v) > 59) v = "59";
    setMinutes(v);
  };

  // Ограничение для часов и автофокус
  const handleHoursChange = (val: string) => {
    let v = val.replace(/[^0-9]/g, "");
    if (v.length > 2) v = v.slice(0, 2);
    setHours(v);
    if (v.length === 2 && minutesRef.current) {
      minutesRef.current.focus();
    }
  };

  // Добавить запись
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const h = Number(hours);
    const m = minutes === "" ? 0 : Number(minutes);
    if (!product.trim() || isNaN(h) || isNaN(m) || h < 0 || m < 0 || m > 59) {
      setError("Введите корректные часы (целое число) и минуты (0-59)");
      return;
    }
    if (!userId) {
      setError("Пользователь не найден");
      return;
    }
    setLoading(true);
    try {
      await outOfStockService.addRecord({
        user_id: userId,
        date,
        product_name: product.trim(),
        hours: h,
        minutes: m,
      });
      setSuccess("Товар добавлен!");
      setProduct("");
      setHours("");
      setMinutes("");
      const updated = await outOfStockService.getRecords({ userId, date });
      setItems(updated);
    } catch (e: any) {
      setError(e.message || "Ошибка добавления");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  // Удалить запись
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await outOfStockService.deleteRecord(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e: any) {
      setError(e.message || "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Учёт отсутствия товаров</h2>
      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-4">
        <div className="flex gap-2 items-end">
          <DatePicker
            id="out-of-stock-date"
            defaultDate={date}
            onChange={([d]: any[]) => d && setDate(d.toISOString().slice(0, 10))}
            placeholder="Дата"
          />
          <div className="flex flex-col">
            <Label htmlFor="product">Наименование</Label>
            <Input
              id="product"
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="Товар"
              className="flex-1"
            />
          </div>
          <div className="flex flex-col w-20">
            <Label htmlFor="hours">Часы</Label>
            <Input
              id="hours"
              value={hours}
              onChange={e => handleHoursChange(e.target.value)}
              placeholder="часы"
              type="text"
              className="w-20"
            />
          </div>
          <div className="flex flex-col w-20">
            <Label htmlFor="minutes">Минуты</Label>
            <Input
              id="minutes"
              value={minutes}
              onChange={e => handleMinutesChange(e.target.value)}
              placeholder="минуты"
              type="text"
              className="w-20"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">Например: 1 час 20 минут — введите 1 и 20</div>
        <Button variant="primary" size="default" disabled={loading}>
          Добавить
        </Button>
      </form>
      {success && (
        <Alert variant="default" className="text-green-600 border-green-200">
          <AlertTitle>Успех</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Дата</th>
              <th className="p-2 text-left">Наименование</th>
              <th className="p-2 text-left">Часы</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.date}</td>
                <td className="p-2">{item.product_name}</td>
                <td className="p-2">{item.hours}:{item.minutes.toString().padStart(2, "0")}</td>
                <td className="p-2">
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} disabled={loading}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-2 text-center text-gray-400">Нет данных</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 