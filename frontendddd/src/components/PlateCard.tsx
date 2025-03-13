
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { AutoPlate } from "@/types/models";
import { useState, useEffect } from "react";

interface PlateCardProps {
  plate: AutoPlate;
}

export const PlateCard = ({ plate }: PlateCardProps) => {
  const isActive = plate.is_active && new Date(plate.deadline) > new Date();
  const timeLeft = formatDistanceToNow(new Date(plate.deadline), { addSuffix: true });
  
  // State to track previous bid value for highlighting changes
  const [prevHighestBid, setPrevHighestBid] = useState<string | null>(plate.highest_bid);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Effect to highlight the bid amount when it changes
  useEffect(() => {
    if (prevHighestBid !== plate.highest_bid && prevHighestBid !== null) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevHighestBid(plate.highest_bid);
  }, [plate.highest_bid, prevHighestBid]);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="font-bold tracking-wider text-lg">{plate.plate_number}</CardTitle>
          {isActive ? (
            <Badge className="bg-auction-success">Active</Badge>
          ) : (
            <Badge variant="destructive">Closed</Badge>
          )}
        </div>
        <CardDescription className="text-sm">{plate.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Ends {timeLeft}</span>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Current bid:</div>
            {plate.highest_bid ? (
              <div 
                className={`text-xl font-bold text-auction-primary transition-colors ${
                  isHighlighted ? 'bg-yellow-100 rounded-sm px-1 py-0.5 -mx-1 scale-105 transition-transform' : ''
                }`}
              >
                ${plate.highest_bid}
              </div>
            ) : (
              <div className="text-lg font-medium text-muted-foreground">No bids yet</div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t pt-3">
        <Link to={`/plates/${plate.id}`} className="w-full">
          <Button className="w-full group bg-auction-secondary hover:bg-auction-primary">
            View Plate
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
