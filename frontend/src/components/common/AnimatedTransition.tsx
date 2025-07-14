import React, { useEffect, useState } from 'react';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  show: boolean;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'scaleOut';
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  show,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, delay, duration]);

  if (!shouldRender) return null;

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration}`;
    
    switch (animation) {
      case 'fadeIn':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      case 'slideUp':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;
      case 'slideDown':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`;
      case 'slideLeft':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`;
      case 'slideRight':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`;
      case 'scaleIn':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
      case 'scaleOut':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`;
      default:
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  return (
    <div className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedTransition;
