
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plateService } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { PlateCreate, PlateUpdate } from "@/types/models";
import { useEffect } from "react";
import { websocketService, WebSocketMessage } from "@/lib/websocket";

export const usePlates = (params?: {
  skip?: number;
  limit?: number;
  ordering?: string;
  plate_number__contains?: string;
}) => {
  const queryClient = useQueryClient();

  // Set up WebSocket listener for plate updates
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketMessage) => {
      if (
        message.resource_type === "plate" ||
        message.resource_type === "bid_on_plate"
      ) {
        // Invalidate the plates query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["plates"] });
        
        // For bid updates on plates, we want to show a toast
        if (message.resource_type === "bid_on_plate") {
          const actionText = message.action.replace("bid_", "");
          toast({
            title: `Bid ${actionText}d`,
            description: `A bid was ${actionText}d on plate #${message.plate_id}`,
          });
        }
      }
    };

    // Add the listener and get the cleanup function
    const removeListener = websocketService.addPlatesListener(handleWebSocketMessage);

    // Return cleanup function
    return () => {
      removeListener();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["plates", params],
    queryFn: () => plateService.getPlates(params),
  });
};

export const usePlateDetails = (id: number) => {
  const queryClient = useQueryClient();

  // Set up WebSocket listener for plate updates
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketMessage) => {
      // If the message is about this specific plate or a bid on this plate
      if (
        (message.resource_type === "plate" && message.data.id === id) ||
        (message.resource_type === "bid_on_plate" && message.plate_id === id)
      ) {
        // Invalidate the plate detail query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["plate", id] });
        
        // Show a toast for bid updates
        if (message.resource_type === "bid_on_plate") {
          const actionText = message.action.replace("bid_", "");
          toast({
            title: `Bid ${actionText}d`,
            description: `A bid was ${actionText}d on this plate`,
          });
        }
      }
    };

    // Add the listener and get the cleanup function
    const removeListener = websocketService.addPlatesListener(handleWebSocketMessage);

    // Return cleanup function
    return () => {
      removeListener();
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["plate", id],
    queryFn: () => plateService.getPlateById(id),
    enabled: !!id,
  });
};

export const useCreatePlate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plateData: PlateCreate) => plateService.createPlate(plateData),
    onSuccess: () => {
      // No need to manually invalidate since the WebSocket will handle it
      toast({
        title: "Success",
        description: "Plate created successfully",
      });
    },
  });
};

export const useUpdatePlate = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plateData: PlateUpdate) => plateService.updatePlate(id, plateData),
    onSuccess: () => {
      // No need to manually invalidate since the WebSocket will handle it
      toast({
        title: "Success",
        description: "Plate updated successfully",
      });
    },
  });
};

export const useDeletePlate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => plateService.deletePlate(id),
    onSuccess: () => {
      // No need to manually invalidate since the WebSocket will handle it
      toast({
        title: "Success",
        description: "Plate deleted successfully",
      });
    },
  });
};
