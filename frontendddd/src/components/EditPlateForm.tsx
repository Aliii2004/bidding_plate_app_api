
import { useState, useEffect } from "react";
import { useUpdatePlate } from "@/hooks/use-plates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { AutoPlate } from "@/types/models";

interface EditPlateFormProps {
  plate: AutoPlate;
  onSuccess?: () => void;
}

export const EditPlateForm = ({ plate, onSuccess }: EditPlateFormProps) => {
  const [plateNumber, setPlateNumber] = useState(plate.plate_number);
  const [description, setDescription] = useState(plate.description);
  const [deadline, setDeadline] = useState(
    format(new Date(plate.deadline), "yyyy-MM-dd'T'HH:mm")
  );
  const [isActive, setIsActive] = useState(plate.is_active);
  
  const updatePlate = useUpdatePlate(plate.id);
  
  // Update form when plate changes
  useEffect(() => {
    setPlateNumber(plate.plate_number);
    setDescription(plate.description);
    setDeadline(format(new Date(plate.deadline), "yyyy-MM-dd'T'HH:mm"));
    setIsActive(plate.is_active);
  }, [plate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updatePlate.mutate({
      plate_number: plateNumber,
      description,
      deadline: new Date(deadline).toISOString(),
      is_active: isActive,
    }, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Plate</CardTitle>
        <CardDescription>Update plate details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g. ABC123"
              required
              maxLength={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the plate..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">Active</Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={updatePlate.isPending}
          >
            {updatePlate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Plate
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
