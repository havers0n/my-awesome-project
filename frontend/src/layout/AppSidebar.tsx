import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from "lucide-react";
import { ICONS } from "@/helpers/icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  new?: boolean;
};

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();

  const navItems: NavItem[] = useMemo(() => [
    {
      icon: <img src={ICONS.GRID} alt="Dashboard icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.dashboard.title'),
      subItems: [
        { name: t('sidebar.nav.dashboard.overview'), path: "/dashboard", pro: false },
        { name: t('sidebar.nav.dashboard.widgets'), path: "/dashboard/widgets", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.PIE_CHART} alt="Sales Forecast icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.salesForecast.title'),
      subItems: [
        { name: t('sidebar.nav.salesForecast.current'), path: "/sales-forecast", pro: false },
        { name: t('sidebar.nav.salesForecast.new'), path: "/sales-forecast-new", pro: false, new: true },
      ],
    },
    {
      icon: <img src={ICONS.TASK_ICON} alt="Test API icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.testApi.title'),
      path: "/test-forecast-api",
    },
    {
      icon: <img src={ICONS.BOX} alt="Inventory icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.inventory.title'),
      path: "/inventory/management",
      new: true,
    },
    {
      icon: <img src={ICONS.BOX} alt="Shelf Availability icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.shelfAvailability.title'),
      path: "/inventory/shelf-availability",
    },
    {
      icon: <img src={ICONS.PIE_CHART} alt="Analytics icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.warehouseAnalytics.title'),
      path: "/analytics/warehouse",
    },
    {
      icon: <img src={ICONS.BOLT} alt="Monitoring icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.monitoring.title'),
      subItems: [
        { name: t('sidebar.nav.monitoring.events'), path: "/monitoring/events", pro: false },
        { name: t('sidebar.nav.monitoring.performance'), path: "/monitoring/performance", pro: false },
        { name: t('sidebar.nav.monitoring.notifications'), path: "/monitoring/notifications", pro: false },
        { name: t('sidebar.nav.monitoring.logs'), path: "/monitoring/logs", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.CALENDAR} alt="Planning icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.planning.title'),
      subItems: [
        { name: t('sidebar.nav.planning.tasks'), path: "/planning/tasks", pro: false },
        { name: t('sidebar.nav.planning.calendar'), path: "/planning/calendar", pro: false },
        { name: t('sidebar.nav.planning.procurement'), path: "/planning/procurement", pro: false },
        { name: t('sidebar.nav.planning.budgeting'), path: "/planning/budget", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.CHECK_CIRCLE} alt="Quality icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.qualityControl.title'),
      subItems: [
        { name: t('sidebar.nav.qualityControl.inspections'), path: "/quality/inspections", pro: false },
        { name: t('sidebar.nav.qualityControl.certificates'), path: "/quality/certificates", pro: false },
        { name: t('sidebar.nav.qualityControl.complaints'), path: "/quality/complaints", pro: false },
        { name: t('sidebar.nav.qualityControl.standards'), path: "/quality/standards", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.DOLLAR_LINE} alt="Finance icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.finance.title'),
      subItems: [
        { name: t('sidebar.nav.finance.budget'), path: "/finance/budget", pro: false },
        { name: t('sidebar.nav.finance.expenses'), path: "/finance/expenses", pro: false },
        { name: t('sidebar.nav.finance.payments'), path: "/finance/payments", pro: false },
        { name: t('sidebar.nav.finance.reports'), path: "/finance/reports", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.FILE} alt="Reports icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.reports.title'),
      subItems: [
        { name: t('sidebar.nav.reports.sales'), path: "/reports/sales", pro: false },
        { name: t('sidebar.nav.reports.warehouse'), path: "/reports/warehouse", pro: false },
        { name: t('sidebar.nav.reports.products'), path: "/reports/products", pro: false },
        { name: t('sidebar.nav.reports.locations'), path: "/reports/locations", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.BOX} alt="Products icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.products.title'),
      subItems: [
        { name: t('sidebar.nav.products.manage'), path: "/products", pro: false },
        { name: t('sidebar.nav.products.categories'), path: "/product-categories", pro: false },
        { name: t('sidebar.nav.products.groups'), path: "/product-groups", pro: false },
        { name: t('sidebar.nav.products.kinds'), path: "/product-kinds", pro: false },
        { name: t('sidebar.nav.products.manufacturers'), path: "/manufacturers", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.FOLDER} alt="Organizations icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.organizations.title'),
      subItems: [
        { name: t('sidebar.nav.organizations.manageOrgs'), path: "/organizations", pro: false },
        { name: t('sidebar.nav.organizations.manageLocs'), path: "/locations", pro: false },
        { name: t('sidebar.nav.organizations.suppliers'), path: "/suppliers", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.USER_CIRCLE} alt="Admin icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.admin.title'),
      subItems: [
        { name: t('sidebar.nav.admin.users'), path: "/admin/users", pro: false },
        { name: t('sidebar.nav.admin.orgs'), path: "/admin/organizations", pro: false },
        { name: t('sidebar.nav.admin.roles'), path: "/admin/roles", pro: false },
        { name: t('sidebar.nav.admin.suppliers'), path: "/admin/suppliers", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.TASK_ICON} alt="Settings icon" className="menu-item-icon-size" />,
      name: t('sidebar.nav.settings.title'),
      subItems: [
        { name: t('sidebar.nav.settings.organization'), path: "/settings/organization", pro: false },
        { name: t('sidebar.nav.settings.system'), path: "/settings/system", pro: false },
      ],
    },
  ], [t]);

  const othersItems: NavItem[] = useMemo(() => [
    {
      icon: <img src={ICONS.LOCK} alt="Security icon" className="menu-item-icon-size" />,
      name: t('sidebar.others.security.title'),
      subItems: [
        { name: t('sidebar.others.security.audit'), path: "/security/audit", pro: false },
        { name: t('sidebar.others.security.access'), path: "/security/access", pro: false },
        { name: t('sidebar.others.security.events'), path: "/security/events", pro: false },
        { name: t('sidebar.others.security.backup'), path: "/security/backup", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.SHOOTING_STAR} alt="Automation icon" className="menu-item-icon-size" />,
      name: t('sidebar.others.automation.title'),
      subItems: [
        { name: t('sidebar.others.automation.workflows'), path: "/automation/workflows", pro: false },
        { name: t('sidebar.others.automation.scheduler'), path: "/automation/scheduler", pro: false },
        { name: t('sidebar.others.automation.notifications'), path: "/automation/notifications", pro: false },
        { name: t('sidebar.others.automation.scripts'), path: "/automation/scripts", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.CHAT} alt="Communication icon" className="menu-item-icon-size" />,
      name: t('sidebar.others.communication.title'),
      subItems: [
        { name: t('sidebar.others.communication.messages'), path: "/communication/messages", pro: false },
        { name: t('sidebar.others.communication.teamNotifications'), path: "/communication/team-notifications", pro: false },
        { name: t('sidebar.others.communication.announcements'), path: "/communication/announcements", pro: false },
        { name: t('sidebar.others.communication.supportChat'), path: "/communication/support-chat", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.PLUG_IN} alt="Integrations icon" className="menu-item-icon-size" />,
      name: t('sidebar.others.integrations.title'),
      subItems: [
        { name: t('sidebar.others.integrations.api'), path: "/integrations/api", pro: false },
        { name: t('sidebar.others.integrations.importExport'), path: "/integrations/import-export", pro: false },
        { name: t('sidebar.others.integrations.external'), path: "/integrations/external", pro: false, new: true },
        { name: t('sidebar.others.integrations.webhooks'), path: "/integrations/webhooks", pro: false },
      ],
    },
    {
      icon: <img src={ICONS.INFO} alt="Help icon" className="menu-item-icon-size" />,
      name: t('sidebar.others.help.title'),
      subItems: [
        { name: t('sidebar.others.help.documentation'), path: "/help/documentation", pro: false },
        { name: t('sidebar.others.help.support'), path: "/help/support", pro: false },
        { name: t('sidebar.others.help.training'), path: "/help/training", pro: false, new: true },
        { name: t('sidebar.others.help.faq'), path: "/help/faq", pro: false },
      ],
    },
  ], [t]);

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = React.useCallback(
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
                  isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
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
          {nav.subItems && (
            <div
              ref={(el) => {
                const key = `${menuType}-${index}`;
                if (el) subMenuRefs.current[key] = el;
              }}
              className="overflow-hidden transition-all duration-200"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? subMenuHeight[`${menuType}-${index}`] || 0
                    : 0,
              }}
            >
              <ul className="flex flex-col gap-2 py-2 pl-8">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-sub-item ${
                        isActive(subItem.path)
                          ? "menu-sub-item-active"
                          : "menu-sub-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      {subItem.new && <span className="new-badge">New</span>}
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
      className={`bg-sidebar-bg text-sidebar-text flex flex-col transition-width duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      } ${(isMobileOpen && isExpanded) ? 'absolute h-full z-20' : 'relative'}`}
      onMouseEnter={() => !isMobileOpen && setIsHovered(true)}
      onMouseLeave={() => !isMobileOpen && setIsHovered(false)}
    >
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="mb-8">
          <span className="text-gray-500 uppercase text-xs tracking-wider">
            {isExpanded || isHovered || isMobileOpen ? t('sidebar.nav.title') : ''}
          </span>
          {renderMenuItems(navItems, "main")}
        </div>
        <div>
          <span className="text-gray-500 uppercase text-xs tracking-wider">
            {isExpanded || isHovered || isMobileOpen ? t('sidebar.others.title') : ''}
          </span>
          {renderMenuItems(othersItems, "others")}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;