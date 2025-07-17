

import React, { useState, useMemo } from 'react';

// Универсальный тип для строк таблицы с опциональными ключами
export type TableData = {
  sku?: string;
  store?: string;
  date?: string;
  r2: number | string;
  mape: number | string;
  [key: string]: string | number | undefined;
};

interface TableProps {
  data: TableData[];
  xKey: 'sku' | 'store' | 'date';
}


export const Table: React.FC<TableProps> = ({ data, xKey }) => {
  const [sortBy, setSortBy] = useState<'r2' | 'mape' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      const aVal = Number(a[sortBy]);
      const bVal = Number(b[sortBy]);
      if (sortDir === 'asc') return aVal - bVal;
      return bVal - aVal;
    });
  }, [data, sortBy, sortDir]);

  // Копирование значения
  const handleCopy = async (value: string | number, key: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedCell(`${key}-${idx}`);
      setTimeout(() => setCopiedCell(null), 1200);
    } catch {}
  };

  // Иконка сортировки
  const SortIcon = ({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) => (
    <span className="inline-block align-middle ml-1">
      {active ? (
        dir === 'asc' ? (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-blue-500"><path d="M10 6l-4 4h8l-4-4z"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-blue-500"><path d="M10 14l4-4H6l4 4z"/></svg>
        )
      ) : (
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-gray-300"><path d="M10 6l-4 4h8l-4-4z"/></svg>
      )}
    </span>
  );

  // Иконка копирования
  const CopyIcon = ({ copied }: { copied: boolean }) => (
    <span className="inline-block align-middle ml-2 cursor-pointer" title={copied ? 'Скопировано!' : 'Копировать'}>
      {copied ? (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 hover:text-blue-500"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2}/><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth={2}/></svg>
      )}
    </span>
  );

  return (
    <div className="bg-white rounded shadow p-4 mb-4 overflow-x-auto">
      <table className="min-w-full select-text">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">{xKey === 'sku' ? 'Товар' : 'Магазин'}</th>
            <th
              className="px-4 py-2 text-left cursor-pointer select-none"
              onClick={() => {
                setSortBy('r2');
                setSortDir(sortBy === 'r2' && sortDir === 'desc' ? 'asc' : 'desc');
              }}
            >
              R²
              <SortIcon active={sortBy === 'r2'} dir={sortDir} />
            </th>
            <th
              className="px-4 py-2 text-left cursor-pointer select-none"
              onClick={() => {
                setSortBy('mape');
                setSortDir(sortBy === 'mape' && sortDir === 'desc' ? 'asc' : 'desc');
              }}
            >
              MAPE
              <SortIcon active={sortBy === 'mape'} dir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2">{row[xKey] ?? '-'}</td>
              <td className="px-4 py-2 group">
                <span>{row.r2}</span>
                <span
                  onClick={() => handleCopy(row.r2, 'r2', idx)}
                  className="align-middle"
                  style={{ verticalAlign: 'middle' }}
                >
                  <CopyIcon copied={copiedCell === `r2-${idx}`} />
                </span>
              </td>
              <td className="px-4 py-2 group">
                <span>{row.mape}</span>
                <span
                  onClick={() => handleCopy(row.mape, 'mape', idx)}
                  className="align-middle"
                  style={{ verticalAlign: 'middle' }}
                >
                  <CopyIcon copied={copiedCell === `mape-${idx}`} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
