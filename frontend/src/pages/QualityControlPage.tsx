import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Award, MessageSquare, TrendingUp, Calendar, Users } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

interface QualityInspection {
  id: string;
  productName: string;
  inspectionType: string;
  status: 'passed' | 'failed' | 'pending';
  inspector: string;
  date: string;
  score: number;
  notes: string;
}

interface Certificate {
  id: string;
  name: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'expiring';
  authority: string;
}

interface Complaint {
  id: string;
  productName: string;
  customerName: string;
  type: 'quality' | 'delivery' | 'service';
  status: 'open' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  date: string;
  description: string;
}

const QualityControlPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inspections' | 'certificates' | 'complaints'>('inspections');

  const [inspections, setInspections] = useState<QualityInspection[]>([
    {
      id: '1',
      productName: 'Молоко "Простоквашино" 3.2%',
      inspectionType: 'Входной контроль',
      status: 'passed',
      inspector: 'Петров И.С.',
      date: '2024-01-16',
      score: 95,
      notes: 'Все показатели в норме'
    },
    {
      id: '2',
      productName: 'Хлеб "Бородинский"',
      inspectionType: 'Плановая проверка',
      status: 'failed',
      inspector: 'Сидорова М.А.',
      date: '2024-01-15',
      score: 72,
      notes: 'Нарушение срока годности'
    },
    {
      id: '3',
      productName: 'Яблоки "Антоновка"',
      inspectionType: 'Выборочная проверка',
      status: 'pending',
      inspector: 'Козлов А.В.',
      date: '2024-01-16',
      score: 0,
      notes: 'Проверка в процессе'
    }
  ]);

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      name: 'Сертификат соответствия ГОСТ Р',
      type: 'Качество продукции',
      issueDate: '2023-06-15',
      expiryDate: '2024-06-15',
      status: 'expiring',
      authority: 'Ростест'
    },
    {
      id: '2',
      name: 'ISO 9001:2015',
      type: 'Система менеджмента качества',
      issueDate: '2023-01-10',
      expiryDate: '2026-01-10',
      status: 'active',
      authority: 'SGS'
    },
    {
      id: '3',
      name: 'HACCP сертификат',
      type: 'Безопасность пищевых продуктов',
      issueDate: '2022-12-01',
      expiryDate: '2023-12-01',
      status: 'expired',
      authority: 'TÜV NORD'
    }
  ]);

  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      productName: 'Молоко "Домик в деревне"',
      customerName: 'Иванова А.П.',
      type: 'quality',
      status: 'investigating',
      priority: 'high',
      date: '2024-01-15',
      description: 'Продукт имеет неприятный запах'
    },
    {
      id: '2',
      productName: 'Хлеб "Дарницкий"',
      customerName: 'Петров В.И.',
      type: 'quality',
      status: 'resolved',
      priority: 'medium',
      date: '2024-01-14',
      description: 'Плесень на поверхности'
    },
    {
      id: '3',
      productName: 'Доставка заказа №12345',
      customerName: 'Сидорова М.К.',
      type: 'delivery',
      status: 'open',
      priority: 'low',
      date: '2024-01-16',
      description: 'Задержка доставки на 2 дня'
    }
  ]);

  const getStatusColor = (status: string, type: 'inspection' | 'certificate' | 'complaint') => {
    if (type === 'inspection') {
      switch (status) {
        case 'passed':
          return 'text-green-600 bg-green-50';
        case 'failed':
          return 'text-red-600 bg-red-50';
        case 'pending':
          return 'text-yellow-600 bg-yellow-50';
        default:
          return 'text-gray-600 bg-gray-50';
      }
    } else if (type === 'certificate') {
      switch (status) {
        case 'active':
          return 'text-green-600 bg-green-50';
        case 'expired':
          return 'text-red-600 bg-red-50';
        case 'expiring':
          return 'text-yellow-600 bg-yellow-50';
        default:
          return 'text-gray-600 bg-gray-50';
      }
    } else {
      switch (status) {
        case 'resolved':
          return 'text-green-600 bg-green-50';
        case 'open':
          return 'text-red-600 bg-red-50';
        case 'investigating':
          return 'text-yellow-600 bg-yellow-50';
        default:
          return 'text-gray-600 bg-gray-50';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <PageMeta
        title="Контроль качества | Admin Dashboard"
        description="Управление качеством продукции и услуг"
      />
      
      <div className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Контроль качества
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Управление проверками качества, сертификатами и жалобами
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Проверки за месяц</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Активные сертификаты</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Открытые жалобы</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл качества</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4.2</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('inspections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inspections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Проверки качества
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Сертификаты
              </button>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'complaints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Жалобы и возвраты
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'inspections' && (
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {inspection.productName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(inspection.status, 'inspection')}`}>
                            {inspection.status === 'passed' ? 'Пройдено' : 
                             inspection.status === 'failed' ? 'Не пройдено' : 'Ожидает'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {inspection.inspectionType} • {inspection.notes}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{inspection.inspector}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{inspection.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {inspection.score > 0 ? `${inspection.score}/100` : 'Н/Д'}
                        </div>
                        {inspection.score > 0 && (
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                inspection.score >= 90 ? 'bg-green-600' :
                                inspection.score >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${inspection.score}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {certificate.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(certificate.status, 'certificate')}`}>
                            {certificate.status === 'active' ? 'Активный' : 
                             certificate.status === 'expired' ? 'Истек' : 'Истекает'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {certificate.type} • {certificate.authority}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Выдан: {certificate.issueDate}</span>
                          <span>Истекает: {certificate.expiryDate}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {complaint.productName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(complaint.status, 'complaint')}`}>
                            {complaint.status === 'resolved' ? 'Решено' : 
                             complaint.status === 'investigating' ? 'Расследуется' : 'Открыто'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority === 'high' ? 'Высокий' : 
                             complaint.priority === 'medium' ? 'Средний' : 'Низкий'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {complaint.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Клиент: {complaint.customerName}</span>
                          <span>Дата: {complaint.date}</span>
                          <span>Тип: {complaint.type === 'quality' ? 'Качество' : 
                                      complaint.type === 'delivery' ? 'Доставка' : 'Сервис'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QualityControlPage; 