
import { useState } from "react";
import { useCreatePlate } from "@/hooks/use-plates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { Loader2 } from "lucide-react";

interface CreatePlateFormProps {
  onSuccess?: () => void;
}

export const CreatePlateForm = ({ onSuccess }: CreatePlateFormProps) => {
  const [plateNumber, setPlateNumber] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(
    format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm")
  );
  
  const createPlate = useCreatePlate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPlate.mutate({
      plate_number: plateNumber,
      description,
      deadline: new Date(deadline).toISOString(),
    }, {
      onSuccess: () => {
        setPlateNumber("");
        setDescription("");
        setDeadline(format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"));
        
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Plate</CardTitle>
        <CardDescription>Add a new auto plate for auction</CardDescription>
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
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={createPlate.isPending}
          >
            {createPlate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Plate
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
