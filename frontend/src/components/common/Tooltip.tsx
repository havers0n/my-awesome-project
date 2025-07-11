import React, { useState, useRef, useEffect } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { TooltipData } from '../../types/forecast';

interface TooltipProps {
  data: TooltipData;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  data, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current && tooltipRef.current && isVisible) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            y = triggerRect.top - tooltipRect.height - 8;
            break;
          case 'bottom':
            x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            y = triggerRect.bottom + 8;
            break;
          case 'left':
            x = triggerRect.left - tooltipRect.width - 8;
            y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            break;
          case 'right':
            x = triggerRect.right + 8;
            y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            break;
        }

        // Проверяем, что tooltip не выходит за границы экрана
        const padding = 8;
        if (x < padding) x = padding;
        if (y < padding) y = padding;
        if (x + tooltipRect.width > window.innerWidth - padding) {
          x = window.innerWidth - tooltipRect.width - padding;
        }
        if (y + tooltipRect.height > window.innerHeight - padding) {
          y = window.innerHeight - tooltipRect.height - padding;
        }

        setTooltipPosition({ x, y });
      }
    };

    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'none'
          }}
        >
          <div className="font-semibold mb-1">{data.title}</div>
          <div className="text-gray-300 mb-2">{data.description}</div>
          
          {data.examples && data.examples.length > 0 && (
            <div className="mb-2">
              <div className="font-medium text-gray-200 mb-1">Примеры:</div>
              <ul className="text-gray-300 text-xs space-y-1">
                {data.examples.map((example, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-300 mr-1">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {data.links && data.links.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="font-medium text-gray-200 mb-1">Подробнее:</div>
              {data.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-300 hover:text-blue-200 text-xs underline"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {link.text}
                </a>
              ))}
            </div>
          )}
          
          {/* Стрелка для указания направления */}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// Компонент для отображения иконки подсказки
export const TooltipIcon: React.FC<{ data: TooltipData; className?: string }> = ({ 
  data, 
  className = '' 
}) => (
  <Tooltip data={data} className={className}>
    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
  </Tooltip>
);

export default Tooltip;
