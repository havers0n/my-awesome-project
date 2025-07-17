
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ServiceCardProps {
  title: string
  description: string
  price: string
  features: string[]
  isPopular?: boolean
}

export function ServiceCard({ title, description, price, features, isPopular = false }: ServiceCardProps) {
  return (
    <Card className={`
      relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
      ${isPopular 
        ? 'border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10' 
        : 'border border-border bg-card hover:border-primary/50'
      }
    `}>
      {isPopular && (
        <div className="absolute -top-1 -right-1">
          <Badge className="bg-primary text-primary-foreground">
            Популярно
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-card-foreground">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <div className="text-2xl font-bold text-primary">
            {price}
          </div>
        </div>
        
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          className={`
            w-full font-medium transition-all duration-200
            ${isPopular 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }
          `}
        >
          Заказать
        </Button>
      </CardContent>
    </Card>
  )
}
