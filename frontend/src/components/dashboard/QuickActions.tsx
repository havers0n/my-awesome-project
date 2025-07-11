
import React from 'react';
import { ICONS } from '@/constants';
import { Card, CardHeader, CardContent, CardTitle } from './Card';

const QuickActions: React.FC = () => {
    const handleAction = (action: string) => {
        alert(`${action} is a demo feature.`);
    };

  return (
    <Card>
      <CardHeader className="bg-indigo-50">
          <CardTitle icon={<ICONS.Settings className="w-5 h-5 text-indigo-600"/>} title="Quick Actions" subtitle="Frequently used operations"/>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => window.location.reload()} className="group bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3">
            <ICONS.RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium">Refresh Data</span>
          </button>
          <button onClick={() => handleAction('Export')} className="group bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3">
            <ICONS.Download className="w-5 h-5 group-hover:animate-bounce" />
            <span className="font-medium">Export Report</span>
          </button>
          <button onClick={() => handleAction('Scan QR')} className="group bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3">
            <ICONS.Scan className="w-5 h-5 group-hover:scale-110" />
            <span className="font-medium">Scan QR</span>
          </button>
          <button onClick={() => handleAction('Settings')} className="group bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-4 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3">
            <ICONS.Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
