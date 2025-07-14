import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, DollarSign, Plus, Target, Users, TrendingUp } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  progress: number;
}

interface BudgetItem {
  id: string;
  category: string;
  planned: number;
  actual: number;
  remaining: number;
  percentage: number;
}

const PlanningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'budget'>('tasks');

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Обновление системы инвентаризации',
      description: 'Внедрение новых функций для учета товаров',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Иван Петров',
      dueDate: '2024-01-25',
      progress: 65
    },
    {
      id: '2',
      title: 'Анализ продаж Q1',
      description: 'Подготовка отчета по продажам за первый квартал',
      status: 'pending',
      priority: 'medium',
      assignee: 'Мария Сидорова',
      dueDate: '2024-01-30',
      progress: 0
    },
    {
      id: '3',
      title: 'Оптимизация складских процессов',
      description: 'Улучшение логистики и сокращение времени обработки',
      status: 'completed',
      priority: 'medium',
      assignee: 'Алексей Козлов',
      dueDate: '2024-01-15',
      progress: 100
    }
  ]);

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: '1',
      category: 'Закупки товаров',
      planned: 500000,
      actual: 342000,
      remaining: 158000,
      percentage: 68.4
    },
    {
      id: '2',
      category: 'Маркетинг',
      planned: 150000,
      actual: 89000,
      remaining: 61000,
      percentage: 59.3
    },
    {
      id: '3',
      category: 'Операционные расходы',
      planned: 200000,
      actual: 156000,
      remaining: 44000,
      percentage: 78.0
    },
    {
      id: '4',
      category: 'IT инфраструктура',
      planned: 100000,
      actual: 45000,
      remaining: 55000,
      percentage: 45.0
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  return (
    <>
      <PageMeta
        title="Планирование | Admin Dashboard"
        description="Управление задачами, календарем и бюджетом"
      />
      
      <div className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Планирование
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Управление задачами, календарем событий и бюджетом
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Создать задачу</span>
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Всего задач</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Выполнено</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">18</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Просрочено</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Бюджет</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">68%</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Задачи
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Календарь
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'budget'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Бюджет
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                            {task.status === 'completed' ? 'Выполнено' : 
                             task.status === 'in-progress' ? 'В работе' : 'Ожидает'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? 'Высокий' : 
                             task.priority === 'medium' ? 'Средний' : 'Низкий'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.progress}%
                        </div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Календарь событий
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Здесь будет отображаться календарь с запланированными событиями
                </p>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-4">
                {budgetItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.category}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Планируется</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.planned)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Потрачено</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.actual)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Остается</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.remaining)}
                        </p>
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

export default PlanningPage; 