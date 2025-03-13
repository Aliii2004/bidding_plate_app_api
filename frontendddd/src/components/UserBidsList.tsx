
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bid } from "@/types/models";
import { BidsTable } from "./bids/BidsTable";
import { EmptyBidsState } from "./bids/EmptyBidsState";

interface UserBidsListProps {
  bids: Bid[];
  plateNumbers: Record<number, string>;
  highestBids: Record<number, string | null>;
}

export const UserBidsList = ({ bids, plateNumbers, highestBids }: UserBidsListProps) => {
  if (bids.length === 0) {
    return (
      <EmptyBidsState 
        title="Your Bids" 
        description="All your active bids"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bids</CardTitle>
        <CardDescription>Manage your active bids</CardDescription>
      </CardHeader>
      <CardContent>
        <BidsTable 
          bids={bids}
          plateNumbers={plateNumbers}
          highestBids={highestBids}
        />
      </CardContent>
    </Card>
  );
};
