
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bid } from "@/types/models";

interface BidsListProps {
  bids: Bid[];
  title?: string;
  description?: string;
}

export const BidsList = ({ 
  bids, 
  title = "Bid History", 
  description = "All bids placed on this plate"
}: BidsListProps) => {
  // Track previous bids to highlight new ones
  const [prevBidsCount, setPrevBidsCount] = useState(bids.length);
  const [highlightedBidIds, setHighlightedBidIds] = useState<Record<number, boolean>>({});

  // Effect to highlight new bids
  useEffect(() => {
    if (bids.length > prevBidsCount) {
      // Find new bids that weren't present before
      const newHighlights: Record<number, boolean> = {};
      
      // Simple approach: highlight the newest bids based on difference in count
      const newBidsCount = bids.length - prevBidsCount;
      
      // Sort by created_at in descending order and highlight the newest ones
      const sortedBids = [...bids].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      for (let i = 0; i < newBidsCount && i < sortedBids.length; i++) {
        newHighlights[sortedBids[i].id] = true;
      }
      
      setHighlightedBidIds(newHighlights);
      
      // Clear highlighting after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedBidIds({});
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    setPrevBidsCount(bids.length);
  }, [bids.length, prevBidsCount]);

  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">No bids have been placed yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort bids by amount in descending order
  const sortedBids = [...bids].sort((a, b) => 
    parseFloat(b.amount) - parseFloat(a.amount)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBids.map((bid) => (
              <TableRow 
                key={bid.id}
                className={highlightedBidIds[bid.id] ? "bg-yellow-50 animate-pulse" : ""}
              >
                <TableCell className={`font-medium ${highlightedBidIds[bid.id] ? "text-auction-primary font-bold" : ""}`}>
                  ${bid.amount}
                </TableCell>
                <TableCell>User #{bid.user_id}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
