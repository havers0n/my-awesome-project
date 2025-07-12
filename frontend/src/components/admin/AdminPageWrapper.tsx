import React from 'react';
import { DataProvider } from '@/context/DataContext';

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ children }) => {
  return (
    <DataProvider>
      <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: 'var(--admin-background)' }}>
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </div>
    </DataProvider>
  );
};

export default AdminPageWrapper; 