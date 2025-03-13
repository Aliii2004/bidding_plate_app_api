
import { useState, useEffect } from "react";
import { useCreateBid } from "@/hooks/use-bids";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Loader2 } from "lucide-react";

interface PlaceBidFormProps {
  currentHighestBid: string | null;
  plateId: number;
  isActive: boolean;
  deadline: string;
}

export const PlaceBidForm = ({ currentHighestBid, plateId, isActive, deadline }: PlaceBidFormProps) => {
  const [amount, setAmount] = useState("");
  const [previousHighestBid, setPreviousHighestBid] = useState(currentHighestBid);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const createBid = useCreateBid();
  
  const minBid = currentHighestBid 
    ? (parseFloat(currentHighestBid) + 1).toString() 
    : "1";
  
  // Effect to handle real-time bid updates
  useEffect(() => {
    if (currentHighestBid !== previousHighestBid && previousHighestBid !== null) {
      // Highlight the new bid amount
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);
      
      // If user has an amount entered, check if it's still valid
      if (amount && parseFloat(amount) <= parseFloat(currentHighestBid || "0")) {
        toast({
          title: "Outbid Alert",
          description: `Someone placed a higher bid. Your current bid amount is now too low.`,
          variant: "destructive",
        });
      }
      
      return () => clearTimeout(timer);
    }
    setPreviousHighestBid(currentHighestBid);
  }, [currentHighestBid, previousHighestBid, amount]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (currentHighestBid && parseFloat(amount) <= parseFloat(currentHighestBid)) {
      toast({
        title: "Error",
        description: `Your bid must be greater than the current highest bid ($${currentHighestBid})`,
        variant: "destructive",
      });
      return;
    }
    
    createBid.mutate({
      amount: parseFloat(amount),
      plate_id: plateId,
    }, {
      onSuccess: () => {
        setAmount("");
      }
    });
  };
  
  // Check if auction is closed
  const isDeadlinePassed = new Date(deadline) < new Date();
  const isClosed = !isActive || isDeadlinePassed;
  
  return (
    <Card className="border-auction-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle>Place Your Bid</CardTitle>
        <CardDescription>
          {isClosed 
            ? "This auction has ended" 
            : "Enter your bid amount below"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentHighestBid ? (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">Current highest bid:</div>
            <div 
              className={`text-2xl font-bold ${isHighlighted 
                ? 'bg-yellow-100 text-auction-primary rounded-sm px-2 py-1 -mx-2 animate-pulse' 
                : 'text-auction-primary'}`}
            >
              ${currentHighestBid}
            </div>
            {!isClosed && (
              <div className="text-sm text-muted-foreground mt-1">
                Your bid must be at least ${minBid}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">Be the first to bid!</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="amount">Bid Amount ($)</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minBid}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isClosed || createBid.isPending}
                placeholder={`${minBid} or higher`}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isClosed || createBid.isPending}
                className="bg-auction-accent hover:bg-amber-500 text-black"
              >
                {createBid.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing...
                  </>
                ) : (
                  <>
                    Place Bid
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      {isClosed && (
        <CardFooter className="bg-destructive/10 text-destructive border-t py-3 text-center">
          This auction has ended. No more bids can be placed.
        </CardFooter>
      )}
    </Card>
  );
};
