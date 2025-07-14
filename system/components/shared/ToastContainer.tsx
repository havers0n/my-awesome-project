
import React, { useEffect, useState } from 'react';
import { XIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon } from './icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastMessage: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300); // Wait for animation to finish
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onRemove]);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-amber-600',
    };
    
    const Icon = {
        success: CheckCircleIcon,
        error: AlertTriangleIcon,
        info: InfoIcon,
    }[toast.type];

    const animationClass = isExiting ? 'animate-toast-exit' : 'animate-toast-enter';

    return (
        <div className={`flex items-start w-full max-w-sm p-4 text-white rounded-lg shadow-2xl ${typeClasses[toast.type]} ${animationClass}`}>
            <div className="flex-shrink-0 w-6 h-6 mr-3">
                <Icon className="w-full h-full" />
            </div>
            <div className="flex-grow text-sm font-semibold">
                {toast.message}
            </div>
            <button onClick={handleRemove} className="ml-4 -mr-2 -my-2 p-2 rounded-md hover:bg-white/20 transition-colors">
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <>
        <style>{`
            @keyframes toast-enter {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
            .animate-toast-enter {
                animation: toast-enter 0.3s ease-out forwards;
            }
            @keyframes toast-exit {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100%); }
            }
            .animate-toast-exit {
                animation: toast-exit 0.3s ease-in forwards;
            }
        `}</style>
        <div className="fixed top-8 right-8 z-[100] space-y-3">
            {toasts.map(toast => (
                <ToastMessage key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
        </>
    );
};

export default ToastContainer;
