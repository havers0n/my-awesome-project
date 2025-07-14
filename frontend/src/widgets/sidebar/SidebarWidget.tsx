import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router";
import { useSidebar } from "../../context/SidebarContext";
import { BrandLogo } from "@/shared/ui/atoms/BrandLogo";
import { Button } from "@/shared/ui/atoms/Button";
import { Typography } from "@/shared/ui/atoms/Typography";
import { ICONS } from "@/helpers/icons";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  new?: boolean;
  badge?: {
    text: string;
    variant?: 'light' | 'solid' | 'outline';
    color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarWidgetProps {
  /** Секции навигации */
  sections: NavSection[];
  /** Показать логотип */
  showLogo?: boolean;
  /** Показать заголовки секций */
  showSectionTitles?: boolean;
  /** Компактный режим */
  compact?: boolean;
  /** Дополнительные элементы в footer */
  footerContent?: React.ReactNode;
  /** Класс для стилизации */
  className?: string;
  /** Обработчик клика на элемент */
  onItemClick?: (item: NavItem) => void;
  /** Показать индикаторы badge */
  showBadges?: boolean;
  /** Анимация hover */
  enableHover?: boolean;
}

export const SidebarWidget: React.FC<SidebarWidgetProps> = ({
  sections,
  showLogo = true,
  showSectionTitles = true,
  compact = false,
  footerContent,
  className = '',
  onItemClick,
  showBadges = true,
  enableHover = true,
}) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);
  const [subMenuHeights, setSubMenuHeights] = useState<Record<string, number>>({});

  const subMenuRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const isExpanded = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    // Автоматически открывать подменю для активной страницы
    sections.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        if (item.subItems) {
          const hasActiveSubItem = item.subItems.some(subItem => isActive(subItem.path));
          if (hasActiveSubItem) {
            setOpenSubmenu({ sectionIndex, itemIndex });
          }
        }
      });
    });
  }, [location, sections, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.sectionIndex}-${openSubmenu.itemIndex}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeights(prev => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (sectionIndex: number, itemIndex: number) => {
    setOpenSubmenu(prev => {
      if (prev && prev.sectionIndex === sectionIndex && prev.itemIndex === itemIndex) {
        return null;
      }
      return { sectionIndex, itemIndex };
    });
  };

  const handleItemClick = (item: NavItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const renderNavItem = (item: NavItem, sectionIndex: number, itemIndex: number) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isMenuOpen = openSubmenu?.sectionIndex === sectionIndex && openSubmenu?.itemIndex === itemIndex;
    const isItemActive = item.path ? isActive(item.path) : false;

    if (hasSubItems) {
      return (
        <li key={item.name}>
          <button
            onClick={() => handleSubmenuToggle(sectionIndex, itemIndex)}
            className={`menu-item group ${
              isMenuOpen ? 'menu-item-active' : 'menu-item-inactive'
            } cursor-pointer ${
              !isExpanded ? 'lg:justify-center' : 'lg:justify-start'
            }`}
          >
            <span className={`menu-item-icon-size ${
              isMenuOpen ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
            }`}>
              {item.icon}
            </span>
            {isExpanded && (
              <span className="menu-item-text">{item.name}</span>
            )}
            {isExpanded && (
              <svg
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-180 text-brand-500' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {isExpanded && showBadges && item.badge && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                item.badge.variant === 'solid' ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
              }`}>
                {item.badge.text}
              </span>
            )}
          </button>
          {hasSubItems && isExpanded && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${sectionIndex}-${itemIndex}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: isMenuOpen ? `${subMenuHeights[`${sectionIndex}-${itemIndex}`]}px` : '0px',
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {item.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={() => handleItemClick(item)}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path) ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && showBadges && (
                          <span className={`ml-auto ${
                            isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
                          } menu-dropdown-badge`}>
                            new
                          </span>
                        )}
                        {subItem.pro && showBadges && (
                          <span className={`ml-auto ${
                            isActive(subItem.path) ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
                          } menu-dropdown-badge`}>
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={item.name}>
        {item.path ? (
          <Link
            to={item.path}
            onClick={() => handleItemClick(item)}
            className={`menu-item group ${
              isItemActive ? 'menu-item-active' : 'menu-item-inactive'
            }`}
          >
            <span className={`menu-item-icon-size ${
              isItemActive ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
            }`}>
              {item.icon}
            </span>
            {isExpanded && (
              <span className="menu-item-text">{item.name}</span>
            )}
            {isExpanded && item.new && showBadges && (
              <span className={`ml-auto ${
                isItemActive ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'
              } menu-dropdown-badge`}>
                new
              </span>
            )}
          </Link>
        ) : (
          <div className={`menu-item group menu-item-inactive cursor-default`}>
            <span className="menu-item-icon-size menu-item-icon-inactive">
              {item.icon}
            </span>
            {isExpanded && (
              <span className="menu-item-text">{item.name}</span>
            )}
          </div>
        )}
      </li>
    );
  };

  const renderSection = (section: NavSection, sectionIndex: number) => (
    <div key={section.title} className={sectionIndex > 0 ? 'mt-8' : ''}>
      {showSectionTitles && (
        <Typography
          variant="h6"
          size="xs"
          className={`mb-4 uppercase leading-[20px] text-gray-400 ${
            !isExpanded ? 'lg:justify-center' : 'justify-start'
          } flex`}
        >
          {isExpanded ? section.title : (
            <img src={ICONS.HORIZONTAL_DOTS} alt="Section" className="size-6" />
          )}
        </Typography>
      )}
      <ul className="flex flex-col gap-4">
        {section.items.map((item, itemIndex) => renderNavItem(item, sectionIndex, itemIndex))}
      </ul>
    </div>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded ? 'w-[290px]' : 'w-[90px]'
      } ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${className}`}
      onMouseEnter={() => enableHover && !isExpanded && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
    >
      {/* Logo */}
      {showLogo && (
        <div className={`py-8 flex ${!isExpanded ? 'lg:justify-center' : 'justify-start'}`}>
          <Link to="/">
            <BrandLogo variant={isExpanded ? 'full' : 'icon'} />
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {sections.map((section, sectionIndex) => renderSection(section, sectionIndex))}
          </div>
        </nav>

        {/* Footer content */}
        {footerContent && (
          <div className={`mt-auto mb-6 ${!isExpanded ? 'text-center' : ''}`}>
            {footerContent}
          </div>
        )}
      </div>
    </aside>
  );
};
