import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ICONS } from '@/helpers/icons';
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <img src={ICONS.GRID} alt="Dashboard icon" className="menu-item-icon-size" />,
    name: "Dashboard",
    subItems: [
      { name: "Общий обзор", path: "/dashboard/overview", pro: false },
      { name: "Настройка виджетов", path: "/dashboard/widgets", pro: false },
    ],
  },
  {
    icon: <img src={ICONS.PIE_CHART} alt="Sales Forecast icon" className="menu-item-icon-size" />,
    name: "Прогнозирование продаж",
    path: "/sales-forecast",
  },
  {
    icon: <img src={ICONS.TASK_ICON} alt="Test API icon" className="menu-item-icon-size" />,
    name: "Тест API прогноза",
    path: "/test-forecast-api",
  },
  {
    icon: <img src={ICONS.BOX} alt="Shelf Availability icon" className="menu-item-icon-size" />,
    name: "Доступность товаров на полке",
    path: "/inventory/shelf-availability",
  },
  {
    icon: <img src={ICONS.FILE} alt="Reports icon" className="menu-item-icon-size" />,
    name: "Отчеты",
    subItems: [
      { name: "По продажам", path: "/reports/sales", pro: false },
      { name: "По товарам", path: "/reports/products", pro: false },
      { name: "По локациям", path: "/reports/locations", pro: false },
    ],
  },
  {
    icon: <img src={ICONS.BOX} alt="Products icon" className="menu-item-icon-size" />,
    name: "Товары",
    subItems: [
      { name: "Управление товарами", path: "/products", pro: false },
      { name: "Категории", path: "/product-categories", pro: false },
      { name: "Группы", path: "/product-groups", pro: false },
      { name: "Виды", path: "/product-kinds", pro: false },
      { name: "Производители", path: "/manufacturers", pro: false },
    ],
  },
  {
    icon: <img src={ICONS.FOLDER} alt="Organizations icon" className="menu-item-icon-size" />,
    name: "Организации / Точки",
    subItems: [
      { name: "Управление организациями", path: "/organizations", pro: false },
      { name: "Управление точками", path: "/locations", pro: false },
      { name: "Поставщики", path: "/suppliers", pro: false },
    ],
  },
  {
    icon: <img src={ICONS.USER_CIRCLE} alt="Admin icon" className="menu-item-icon-size" />,
    name: "Административная панель",
    subItems: [
      { name: "Управление пользователями", path: "/admin/users", pro: false },
      { name: "Управление организациями", path: "/admin/organizations", pro: false },
      { name: "Управление ролями", path: "/admin/roles", pro: false },
      { name: "Управление поставщиками", path: "/admin/suppliers", pro: false },
    ],
  },
  {
    icon: <img src={ICONS.TASK_ICON} alt="Settings icon" className="menu-item-icon-size" />,
    name: "Настройки",
    subItems: [
      { name: "Настройки организации", path: "/settings/organization", pro: false },
      { name: "Настройки системы", path: "/settings/system", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <img src={ICONS.PLUG_IN} alt="Integrations icon" className="menu-item-icon-size" />,
    name: "Интеграции",
    subItems: [
      { name: "API подключения", path: "/integrations/api", pro: false },
      { name: "Импорт/экспорт данных", path: "/integrations/import-export", pro: false },
    ],
  },
  {
    icon: <img src={ICONS.INFO} alt="Help icon" className="menu-item-icon-size" />,
    name: "Помощь",
    subItems: [
      { name: "Документация", path: "/help/documentation", pro: false },
      { name: "Поддержка", path: "/help/support", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <img
                  src={ICONS.CHEVRON_DOWN}
                  alt="Chevron down icon"
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
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
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Основное меню"
                ) : (
                  <img src={ICONS.HORIZONTAL_DOTS} alt="HorizontaLDots" className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Дополнительно"
                ) : (
                  <img src={ICONS.HORIZONTAL_DOTS} alt="HorizontaLDots" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
