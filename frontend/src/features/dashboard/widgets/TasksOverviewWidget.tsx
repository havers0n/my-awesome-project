import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Target, Calendar, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  progress: number;
}

interface TasksSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  urgentTasks: Task[];
}

const TasksOverviewWidget: React.FC = () => {
  const [tasks, setTasks] = useState<TasksSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Генерация моковых данных для демонстрации
  const generateTasksData = (): TasksSummary => {
    const urgentTasks: Task[] = [
      {
        id: '1',
        title: 'Обновление системы инвентаризации',
        status: 'in-progress',
        priority: 'high',
        assignee: 'Иван Петров',
        dueDate: '2024-01-25',
        progress: 65
      },
      {
        id: '2',
        title: 'Анализ продаж Q1',
        status: 'pending',
        priority: 'high',
        assignee: 'Мария Сидорова',
        dueDate: '2024-01-30',
        progress: 0
      },
      {
        id: '3',
        title: 'Пополнение товаров категории А',
        status: 'pending',
        priority: 'medium',
        assignee: 'Алексей Козлов',
        dueDate: '2024-01-28',
        progress: 25
      },
    ];

    return {
      totalTasks: 24,
      completedTasks: 18,
      inProgressTasks: 4,
      pendingTasks: 2,
      overdueTasks: 3,
      urgentTasks: urgentTasks,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 700));
      setTasks(generateTasksData());
      setLoading(false);
    };

    loadData();
  }, []);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!tasks) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Не удалось загрузить задачи</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="w-5 h-5 mr-2 text-amber-600" />
          Обзор задач
        </h3>
        <span className="text-xs text-gray-500">Сегодня</span>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600">Всего задач</p>
              <p className="text-lg font-bold text-blue-700">{tasks.totalTasks}</p>
            </div>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">Выполнено</p>
              <p className="text-lg font-bold text-green-700">{tasks.completedTasks}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">В работе</p>
              <p className="text-lg font-bold text-yellow-700">{tasks.inProgressTasks}</p>
            </div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600">Просрочено</p>
              <p className="text-lg font-bold text-red-700">{tasks.overdueTasks}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>

      {/* Приоритетные задачи */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Приоритетные задачи:
        </h4>
        <div className="space-y-2">
          {tasks.urgentTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center flex-1 min-w-0">
                  {getStatusIcon(task.status)}
                  <span className="ml-2 text-sm truncate font-medium">{task.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Высокий' : 
                   task.priority === 'medium' ? 'Средний' : 'Низкий'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>{task.assignee}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>
              {task.progress > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Прогресс</span>
                    <span className="text-xs font-medium">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksOverviewWidget; 