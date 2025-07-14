import { useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  title?: string;
  description?: string;
  initialFocus?: React.RefObject<HTMLElement>;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
  title,
  description,
  initialFocus,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap functionality
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    return Array.from(modalRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Tab') {
      handleTabKey(e);
    }
  }, [onClose, handleTabKey]);

  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before opening the modal
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      document.body.setAttribute('aria-hidden', 'true');
      
      // Add event listeners
      document.addEventListener("keydown", handleKeyDown);
      
      // Focus management
      setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = "unset";
      document.body.removeAttribute('aria-hidden');
      
      // Remove event listeners
      document.removeEventListener("keydown", handleKeyDown);
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.removeAttribute('aria-hidden');
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, getFocusableElements, initialFocus]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full rounded-3xl bg-white dark:bg-gray-900";

  const modalId = `modal-${Date.now()}`;
  const titleId = title ? `${modalId}-title` : undefined;
  const descriptionId = description ? `${modalId}-description` : undefined;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={modalRef}
        className={`${contentClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen reader only title */}
        {title && (
          <h1 id={titleId} className="sr-only">
            {title}
          </h1>
        )}
        
        {/* Screen reader only description */}
        {description && (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        )}
        
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );

  // Render modal in portal to ensure proper z-index and accessibility
  return createPortal(modalContent, document.body);
};
