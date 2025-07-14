import React from "react";

interface BrandLogoProps {
  variant?: 'mobile' | 'desktop';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'desktop',
  className = "",
}) => {
  const isMobile = variant === 'mobile';
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center ${
        isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'
      }`}>
        D
      </div>
      {!isMobile && (
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </span>
      )}
    </div>
  );
};
