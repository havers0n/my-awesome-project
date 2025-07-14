
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

export const CardTitle: React.FC<{icon: React.ReactNode, title: string, subtitle: string}> = ({icon, title, subtitle}) => (
    <div className="flex items-center gap-3">
        <div className="bg-blue-100 rounded-full p-2">
            {icon}
        </div>
        <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
    </div>
)
