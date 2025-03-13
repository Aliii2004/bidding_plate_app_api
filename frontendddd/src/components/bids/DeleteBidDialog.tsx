
import { useDeleteBid } from "@/hooks/use-bids";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteBidDialogProps {
  isOpen: boolean;
  bidId: number | null;
  plateId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteBidDialog = ({ 
  isOpen, 
  bidId, 
  plateId, 
  onClose, 
  onSuccess 
}: DeleteBidDialogProps) => {
  const deleteBidMutation = useDeleteBid(plateId || 0);
  
  const confirmDelete = () => {
    if (bidId !== null) {
      deleteBidMutation.mutate(bidId, {
        onSuccess: () => {
          onSuccess();
        }
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bid</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this bid? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete} 
            className="bg-red-500 hover:bg-red-600"
            disabled={deleteBidMutation.isPending}
          >
            {deleteBidMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
