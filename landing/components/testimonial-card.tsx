import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  rating: number
}

export function TestimonialCard({ quote, author, role, rating }: TestimonialCardProps) {
  return (
    <Card className="border-0 shadow-md h-full flex flex-col">
      <CardContent className="pt-6 flex-1">
        <div className="mb-4 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? "text-upcoming fill-upcoming" : "text-muted-foreground"}`} />
          ))}
        </div>
        <p className="text-foreground italic mb-4">"{quote}"</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
