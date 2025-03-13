
import { useState } from "react";
import { useUpdateBid } from "@/hooks/use-bids";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { Bid } from "@/types/models";
import { toast } from "@/hooks/use-toast";

interface EditBidFormProps {
  bid: Bid;
  highestBids: Record<number, string | null>;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditBidForm = ({ bid, highestBids, onCancel, onSuccess }: EditBidFormProps) => {
  const [newAmount, setNewAmount] = useState(bid.amount);
  
  const updateBidMutation = useUpdateBid(bid.id, bid.plate_id);
  
  const handleUpdate = () => {
    if (!newAmount || parseFloat(newAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    const highestBid = highestBids[bid.plate_id];
    if (highestBid && parseFloat(newAmount) <= parseFloat(highestBid) && parseFloat(bid.amount) !== parseFloat(highestBid)) {
      toast({
        title: "Error",
        description: `Your bid must be higher than the current highest bid ($${highestBid})`,
        variant: "destructive",
      });
      return;
    }
    
    updateBidMutation.mutate({ amount: parseFloat(newAmount) }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        step="0.01"
        value={newAmount}
        onChange={(e) => setNewAmount(e.target.value)}
        className="max-w-28"
      />
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={handleUpdate}
        disabled={updateBidMutation.isPending}
        className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-100"
      >
        {updateBidMutation.isPending ? 
          <Loader2 className="h-4 w-4 animate-spin" /> : 
          <Check className="h-4 w-4" />
        }
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={onCancel}
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
