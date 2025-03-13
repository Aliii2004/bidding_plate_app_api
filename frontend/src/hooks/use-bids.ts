
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bidService } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { BidCreate, BidUpdate } from "@/types/models";
import { useEffect } from "react";
import { websocketService, WebSocketMessage } from "@/lib/websocket";

export const useUserBids = (params?: {
  skip?: number;
  limit?: number;
}) => {
  const queryClient = useQueryClient();

  // Set up WebSocket listener for bid updates
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketMessage) => {
      if (message.resource_type === "bid") {
        // Invalidate the userBids query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["userBids"] });
        
        const actionMap: Record<string, string> = {
          "create": "placed",
          "update": "updated",
          "delete": "withdrawn"
        };
        
        const actionText = actionMap[message.action] || message.action;
        
        toast({
          title: `Bid ${actionText}`,
          description: `Amount: $${message.data.amount}`,
        });
      }
    };

    // Add the listener and get the cleanup function
    const removeListener = websocketService.addBidsListener(handleWebSocketMessage);

    // Return cleanup function
    return () => {
      removeListener();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["userBids", params],
    queryFn: () => bidService.getUserBids(params),
  });
};

export const useBidDetails = (id: number) => {
  const queryClient = useQueryClient();

  // Set up WebSocket listener for specific bid updates
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketMessage) => {
      if (message.resource_type === "bid" && message.data.id === id) {
        // Invalidate the bid detail query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["bid", id] });
      }
    };

    // Add the listener and get the cleanup function
    const removeListener = websocketService.addBidsListener(handleWebSocketMessage);

    // Return cleanup function
    return () => {
      removeListener();
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["bid", id],
    queryFn: () => bidService.getBidById(id),
    enabled: !!id,
  });
};

export const useCreateBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bidData: BidCreate) => bidService.createBid(bidData),
    onSuccess: (_, variables) => {
      // No need to manually invalidate since the WebSocket will handle it
      toast({
        title: "Success",
        description: "Bid placed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to place bid",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateBid = (id: number, plateId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bidData: BidUpdate) => bidService.updateBid(id, bidData),
    onSuccess: () => {
      // No need to manually invalidate since the WebSocket will handle it
      toast({
        title: "Success",
        description: "Bid updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bid",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteBid = (plateId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bidService.deleteBid(id),
    onSuccess: () => {
      // No need to manually invalidate since the WebSocket will handle it
      toast({
        title: "Success",
        description: "Bid deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete bid",
        variant: "destructive",
      });
    }
  });
};
