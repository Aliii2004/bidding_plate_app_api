
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bid } from "@/types/models";
import { BidRow } from "./BidRow";
import { DeleteBidDialog } from "./DeleteBidDialog";

interface BidsTableProps {
  bids: Bid[];
  plateNumbers: Record<number, string>;
  highestBids: Record<number, string | null>;
}

export const BidsTable = ({ bids, plateNumbers, highestBids }: BidsTableProps) => {
  const [editingBidId, setEditingBidId] = useState<number | null>(null);
  const [deletingBidId, setDeletingBidId] = useState<number | null>(null);
  const [deletingPlateId, setDeletingPlateId] = useState<number | null>(null);
  
  // Sort bids by created_at in descending order
  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleEditStart = (bid: Bid) => {
    setEditingBidId(bid.id);
  };

  const handleEditEnd = () => {
    setEditingBidId(null);
  };

  const handleDeleteStart = (bid: Bid) => {
    setDeletingBidId(bid.id);
    setDeletingPlateId(bid.plate_id);
  };

  const handleDeleteEnd = () => {
    setDeletingBidId(null);
    setDeletingPlateId(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBids.map((bid) => (
            <BidRow 
              key={bid.id}
              bid={bid}
              plateNumber={plateNumbers[bid.plate_id]}
              highestBids={highestBids}
              isEditing={editingBidId === bid.id}
              onEditStart={handleEditStart}
              onEditEnd={handleEditEnd}
              onDeleteStart={handleDeleteStart}
            />
          ))}
        </TableBody>
      </Table>

      {deletingBidId !== null && (
        <DeleteBidDialog 
          isOpen={deletingBidId !== null}
          bidId={deletingBidId}
          plateId={deletingPlateId}
          onClose={handleDeleteEnd}
          onSuccess={handleDeleteEnd}
        />
      )}
    </>
  );
};
