
import React from 'react';
import { Notification, NotificationType } from '@/types.admin';
import { ICONS } from '@/constants';
import { Card, CardHeader, CardContent } from './Card';

interface NotificationsPanelProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
  onDismissAll: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onDismiss, onDismissAll }) => {
  if (notifications.length === 0) {
    return null;
  }

  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Error:
        return 'bg-red-50 border-red-400';
      case NotificationType.Warning:
        return 'bg-yellow-50 border-yellow-400';
      case NotificationType.Info:
      default:
        return 'bg-blue-50 border-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader className="bg-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <ICONS.Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-600">Important events and warnings</p>
            </div>
          </div>
          <button
            onClick={onDismissAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-xl border-l-4 ${getNotificationStyle(notification.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ICONS.XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
