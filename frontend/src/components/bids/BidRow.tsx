
import { formatDistanceToNow } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";
import { Bid } from "@/types/models";
import { EditBidForm } from "./EditBidForm";
import { useState, useEffect } from "react";

interface BidRowProps {
  bid: Bid;
  plateNumber: string;
  highestBids: Record<number, string | null>;
  isEditing: boolean;
  onEditStart: (bid: Bid) => void;
  onEditEnd: () => void;
  onDeleteStart: (bid: Bid) => void;
}

export const BidRow = ({ 
  bid, 
  plateNumber, 
  highestBids, 
  isEditing, 
  onEditStart, 
  onEditEnd,
  onDeleteStart
}: BidRowProps) => {
  const isHighestBid = highestBids[bid.plate_id] && 
    parseFloat(bid.amount) === parseFloat(highestBids[bid.plate_id]!);
    
  const [prevStatus, setPrevStatus] = useState(isHighestBid);
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  
  // Effect to highlight status changes (becoming highest or being outbid)
  useEffect(() => {
    if (prevStatus !== isHighestBid) {
      setIsStatusChanged(true);
      const timer = setTimeout(() => {
        setIsStatusChanged(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    setPrevStatus(isHighestBid);
  }, [isHighestBid, prevStatus]);

  return (
    <TableRow className={isStatusChanged ? "bg-yellow-50 animate-pulse" : ""}>
      <TableCell className="font-medium">
        {plateNumber || `Plate #${bid.plate_id}`}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <EditBidForm 
            bid={bid} 
            highestBids={highestBids}
            onCancel={onEditEnd}
            onSuccess={onEditEnd}
          />
        ) : (
          <span className={isHighestBid ? "font-bold text-auction-success" : ""}>
            ${bid.amount}
          </span>
        )}
      </TableCell>
      <TableCell>
        {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
      </TableCell>
      <TableCell>
        {isHighestBid ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${
            isStatusChanged && isHighestBid ? "animate-pulse bg-green-200" : ""
          }`}>
            Highest Bid
          </span>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${
            isStatusChanged && !isHighestBid ? "animate-pulse bg-yellow-200" : ""
          }`}>
            Outbid
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {!isEditing && (
          <div className="flex justify-end space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onEditStart(bid)}
              className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onDeleteStart(bid)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
