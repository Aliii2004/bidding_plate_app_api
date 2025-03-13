
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlates } from "@/hooks/use-plates";
import { Header } from "@/components/Header";
import { CreatePlateForm } from "@/components/CreatePlateForm";
import { EditPlateForm } from "@/components/EditPlateForm";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Search, PlusCircle, Edit, Trash, Loader2 } from "lucide-react";
import { useDeletePlate } from "@/hooks/use-plates";

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [selectedPlate, setSelectedPlate] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: plates, isLoading, refetch } = usePlates({
    plate_number__contains: currentSearch,
  });
  
  const handleSearch = () => {
    setCurrentSearch(searchTerm);
  };
  
  const deletePlate = useDeletePlate();
  const { toast } = useToast();
  
  const handleDelete = (plateId: number) => {
    deletePlate.mutate(plateId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Plate deleted successfully",
        });
        refetch();
      }
    });
  };
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-auction-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage auto plates and monitor auctions
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-auction-primary hover:bg-auction-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Plate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Plate</DialogTitle>
                <DialogDescription>
                  Add a new auto plate to the bidding platform
                </DialogDescription>
              </DialogHeader>
              <CreatePlateForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-auction-primary" />
            </div>
          ) : plates && plates.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Highest Bid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plates.map((plate) => {
                    const isActive = plate.is_active && new Date(plate.deadline) > new Date();
                    
                    return (
                      <TableRow key={plate.id}>
                        <TableCell className="font-medium">{plate.id}</TableCell>
                        <TableCell>{plate.plate_number}</TableCell>
                        <TableCell className="max-w-xs truncate">{plate.description}</TableCell>
                        <TableCell>{format(new Date(plate.deadline), "PP p")}</TableCell>
                        <TableCell>
                          {isActive ? (
                            <Badge className="bg-auction-success">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Closed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {plate.highest_bid ? `$${plate.highest_bid}` : "No bids"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog open={isEditDialogOpen && selectedPlate === plate.id} onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (!open) setSelectedPlate(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedPlate(plate.id);
                                    setIsEditDialogOpen(true);
                                  }}
                                  className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Plate</DialogTitle>
                                  <DialogDescription>
                                    Update the details for plate {plate.plate_number}
                                  </DialogDescription>
                                </DialogHeader>
                                <EditPlateForm 
                                  plate={plate} 
                                  onSuccess={() => {
                                    setIsEditDialogOpen(false);
                                    setSelectedPlate(null);
                                  }} 
                                />
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog open={isDeleteDialogOpen && selectedPlate === plate.id} onOpenChange={(open) => {
                              setIsDeleteDialogOpen(open);
                              if (!open) setSelectedPlate(null);
                            }}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedPlate(plate.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Plate</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the plate <strong>{plate.plate_number}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(plate.id)}
                                    className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                  >
                                    {deletePlate.isPending && selectedPlate === plate.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">
                {currentSearch ? `No results for "${currentSearch}"` : "No plates found"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Add Your First Plate
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
