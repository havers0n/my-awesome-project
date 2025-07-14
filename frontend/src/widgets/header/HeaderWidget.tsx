import React from "react";
import { useLocation, Link } from "react-router";
import { useSidebar } from "../../context/SidebarContext";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";
import NotificationDropdown from "../../components/header/NotificationDropdown";
import UserDropdown from "../../components/header/UserDropdown";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { BrandLogo } from "@/shared/ui/atoms/BrandLogo";
import { Button } from "@/shared/ui/atoms/Button";

interface HeaderWidgetProps {
  /** Показать поиск */
  showSearch?: boolean;
  /** Показать уведомления */
  showNotifications?: boolean;
  /** Показать переключатель темы */
  showThemeToggle?: boolean;
  /** Показать пользовательское меню */
  showUserMenu?: boolean;
  /** Показать логотип на мобильных устройствах */
  showMobileLogo?: boolean;
  /** Показать кнопку меню */
  showMenuButton?: boolean;
  /** Дополнительные элементы в шапке */
  additionalElements?: React.ReactNode;
  /** Класс для стилизации */
  className?: string;
  /** Обработчик поиска */
  onSearch?: (query: string) => void;
  /** Плейсхолдер для поиска */
  searchPlaceholder?: string;
  /** Показать хлебные крошки */
  showBreadcrumbs?: boolean;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({
  showSearch = true,
  showNotifications = true,
  showThemeToggle = true,
  showUserMenu = true,
  showMobileLogo = true,
  showMenuButton = true,
  additionalElements,
  className = '',
  onSearch,
  searchPlaceholder = "Поиск или введите команду...",
  showBreadcrumbs = false,
}) => {
  const location = useLocation();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Главная', path: '/' },
    ];

    pathnames.forEach((pathname, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = pathname.charAt(0).toUpperCase() + pathname.slice(1);
      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const renderBreadcrumbs = () => {
    if (!showBreadcrumbs) return null;

    return (
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path || crumb.label}>
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {crumb.path && index !== breadcrumbs.length - 1 ? (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <header className={`sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b ${className}`}>
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* Top section - Mobile menu button, logo, and mobile actions */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Menu toggle button */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </Button>
          )}

          {/* Mobile logo */}
          {showMobileLogo && (
            <Link to="/" className="lg:hidden">
              <BrandLogo variant="mobile" />
            </Link>
          )}

          {/* Desktop search bar */}
          {showSearch && (
            <div className="hidden lg:block">
              <SearchBar
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                showShortcut
              />
            </div>
          )}

          {/* Additional elements */}
          {additionalElements}
        </div>

        {/* Bottom section - Actions and user menu */}
        <div className="flex items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none">
          {/* Breadcrumbs */}
          <div className="hidden lg:block lg:mr-auto">
            {renderBreadcrumbs()}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* Theme toggle */}
            {showThemeToggle && <ThemeToggleButton />}

            {/* Notifications */}
            {showNotifications && <NotificationDropdown />}
          </div>

          {/* User menu */}
          {showUserMenu && <UserDropdown />}
        </div>
      </div>
    </header>
  );
};
