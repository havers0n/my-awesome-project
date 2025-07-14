import React from "react";
import { Outlet } from "react-router";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { HeaderWidget } from "../header/HeaderWidget";
import { SidebarWidget } from "../sidebar/SidebarWidget";
import { ICONS } from "@/helpers/icons";

interface AppLayoutWidgetProps {
  /** Конфигурация header */
  headerConfig?: {
    showSearch?: boolean;
    showNotifications?: boolean;
    showThemeToggle?: boolean;
    showUserMenu?: boolean;
    showBreadcrumbs?: boolean;
    searchPlaceholder?: string;
  };
  /** Конфигурация sidebar */
  sidebarConfig?: {
    showLogo?: boolean;
    showSectionTitles?: boolean;
    enableHover?: boolean;
    footerContent?: React.ReactNode;
  };
  /** Навигационные секции */
  navigationSections?: Array<{
    title: string;
    items: Array<{
      name: string;
      icon: React.ReactNode;
      path?: string;
      subItems?: Array<{ name: string; path: string; pro?: boolean; new?: boolean }>;
      new?: boolean;
    }>;
  }>;
  /** Дополнительные классы для основного контейнера */
  className?: string;
  /** Дополнительные классы для области контента */
  contentClassName?: string;
  /** Максимальная ширина контента */
  maxContentWidth?: string;
  /** Отступы контента */
  contentPadding?: string;
  /** Показать backdrop на мобильных устройствах */
  showMobileBackdrop?: boolean;
}

// Навигационные секции по умолчанию
const defaultNavigationSections = [
  {
    title: "Основное меню",
    items: [
      {
        icon: <img src={ICONS.GRID} alt="Dashboard icon" className="menu-item-icon-size" />,
        name: "Dashboard",
        subItems: [
          { name: "Общий обзор", path: "/dashboard", pro: false },
          { name: "Настройка виджетов", path: "/dashboard/widgets", pro: false },
        ],
      },
      {
        icon: <img src={ICONS.PIE_CHART} alt="Sales Forecast icon" className="menu-item-icon-size" />,
        name: "Прогнозирование продаж",
        subItems: [
          { name: "Текущий прогноз", path: "/sales-forecast", pro: false },
          { name: "Новый прогноз", path: "/sales-forecast-new", pro: false, new: true },
        ],
      },
      {
        icon: <img src={ICONS.TASK_ICON} alt="Test API icon" className="menu-item-icon-size" />,
        name: "Тест API прогноза",
        path: "/test-forecast-api",
      },
      {
        icon: <img src={ICONS.BOX} alt="Inventory icon" className="menu-item-icon-size" />,
        name: "Управление запасами",
        path: "/inventory/management",
        new: true,
      },
    ],
  },
  {
    title: "Дополнительно",
    items: [
      {
        icon: <img src={ICONS.LOCK} alt="Security icon" className="menu-item-icon-size" />,
        name: "Безопасность",
        subItems: [
          { name: "Аудит безопасности", path: "/security/audit", pro: false },
          { name: "Управление доступом", path: "/security/access", pro: false },
        ],
      },
      {
        icon: <img src={ICONS.PLUG_IN} alt="Integrations icon" className="menu-item-icon-size" />,
        name: "Интеграции",
        subItems: [
          { name: "API подключения", path: "/integrations/api", pro: false },
          { name: "Внешние сервисы", path: "/integrations/external", pro: false, new: true },
        ],
      },
    ],
  },
];

const LayoutContent: React.FC<AppLayoutWidgetProps> = ({
  headerConfig = {},
  sidebarConfig = {},
  navigationSections = defaultNavigationSections,
  className = '',
  contentClassName = '',
  maxContentWidth = 'max-w-7xl',
  contentPadding = 'p-4 md:p-6',
  showMobileBackdrop = true,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const renderMobileBackdrop = () => {
    if (!showMobileBackdrop || !isMobileOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={() => {
          // Закрыть мобильное меню при клике на backdrop
          const { toggleMobileSidebar } = useSidebar();
          toggleMobileSidebar();
        }}
      />
    );
  };

  return (
    <div className={`min-h-screen xl:flex ${className}`}>
      {/* Sidebar */}
      <div>
        <SidebarWidget
          sections={navigationSections}
          showLogo={sidebarConfig.showLogo}
          showSectionTitles={sidebarConfig.showSectionTitles}
          enableHover={sidebarConfig.enableHover}
          footerContent={sidebarConfig.footerContent}
        />
        {renderMobileBackdrop()}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[320px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        {/* Header */}
        <HeaderWidget
          showSearch={headerConfig.showSearch}
          showNotifications={headerConfig.showNotifications}
          showThemeToggle={headerConfig.showThemeToggle}
          showUserMenu={headerConfig.showUserMenu}
          showBreadcrumbs={headerConfig.showBreadcrumbs}
          searchPlaceholder={headerConfig.searchPlaceholder}
        />

        {/* Page Content */}
        <div className={`${contentPadding} mx-auto ${maxContentWidth} ${contentClassName}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export const AppLayoutWidget: React.FC<AppLayoutWidgetProps> = (props) => {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
};
