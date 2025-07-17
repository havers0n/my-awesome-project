import { useState } from "react"
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Globe, 
  CreditCard, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  Gift,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigationItems = [
  { title: "Виртуальный сервер", icon: Server, active: true },
  { title: "Hi-CPU сервер", icon: Cpu },
  { title: "Выделенный сервер", icon: HardDrive },
  { title: "Домен", icon: Globe },
]

const serviceItems = [
  { title: "Мои услуги", icon: BarChart3 },
  { title: "Финансы", icon: CreditCard },
  { title: "Реферальная система", icon: Users },
  { title: "Настройки", icon: Settings },
  { title: "Лимиты", icon: Shield },
  { title: "Бонусы", icon: Gift },
]

export function HostingSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">a</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">eza</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-sidebar-foreground uppercase tracking-wider mb-3">
              создать
            </p>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3",
                  item.active 
                    ? "bg-sidebar-accent text-sidebar-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Button>
            ))}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-sidebar-foreground uppercase tracking-wider mb-3">
              основное
            </p>
          )}
          <nav className="space-y-1">
            {serviceItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Support Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3 rounded-lg bg-gradient-accent p-3">
          <Shield className="h-5 w-5 text-accent-foreground" />
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-accent-foreground">Поддержка</p>
              <p className="text-xs text-accent-foreground/80">~97,5% ★</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}