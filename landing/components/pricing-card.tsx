import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  highlighted?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  highlighted = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col border-2 h-full",
        highlighted
          ? "border-primary shadow-lg scale-105"
          : "border-border shadow-md"
      )}
    >
      <CardHeader className={cn("pb-8", highlighted && "bg-primary/5")}>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{price}</span>
            {period && <span className="text-muted-foreground">/{period}</span>}
          </div>
          <p className="text-sm text-muted-foreground pt-2">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Link href="https://finely-app.orbot.co/register" className="w-full">
          <Button
            variant={buttonVariant}
            className={cn(
              "w-full",
              highlighted &&
                "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
            )}
            disabled={disabled}
          >
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
