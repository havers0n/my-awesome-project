
import React from 'react';

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded-2xl animate-pulse ${className}`} />
);

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="animate-fadeIn">
            {/* Header Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <SkeletonBox className="lg:col-span-1 h-80" />
                <SkeletonBox className="lg:col-span-2 h-80" />
            </main>
            
            {/* Product List Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center">
                        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                </div>
                <div className="p-6 space-y-2">
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
