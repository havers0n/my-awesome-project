import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Wallet, Bell } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          0 ₽
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>aleshkatokareff@yandex.ru</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Wallet className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8 px-3 text-xs"
          >
            Выйти
          </Button>
        </div>
      </div>
    </header>
  )
}