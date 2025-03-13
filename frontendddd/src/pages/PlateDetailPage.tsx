
import { useParams, Link } from "react-router-dom";
import { usePlateDetails } from "@/hooks/use-plates";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { PlaceBidForm } from "@/components/PlaceBidForm";
import { BidsList } from "@/components/BidsList";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Clock, Calendar, Info, Loader2 } from "lucide-react";

const PlateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const plateId = parseInt(id || "0");
  const { data: plate, isLoading, isError } = usePlateDetails(plateId);
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-auction-primary" />
        </div>
      </div>
    );
  }
  
  if (isError || !plate) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">Plate Not Found</h1>
          <p className="text-muted-foreground mb-6">The plate you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const deadline = new Date(plate.deadline);
  const isDeadlinePassed = deadline < new Date();
  const isActive = plate.is_active && !isDeadlinePassed;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-auction-primary hover:underline inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all plates
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-3xl font-bold">{plate.plate_number}</CardTitle>
                    {plate.description && (
                      <CardDescription className="mt-2 text-base">
                        {plate.description}
                      </CardDescription>
                    )}
                  </div>
                  <div>
                    {isActive ? (
                      <Badge className="bg-auction-success text-white">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Bidding Closed</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-auction-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Ends in</div>
                      <div className="font-medium">
                        {isDeadlinePassed
                          ? "Bidding ended"
                          : formatDistanceToNow(deadline, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-auction-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Deadline</div>
                      <div className="font-medium">
                        {format(deadline, "PPp")}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-auction-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">About this plate</h3>
                      <p className="text-muted-foreground">
                        This is a unique auto plate available for auction. The highest bid at the deadline will win the plate.
                      </p>
                    </div>
                  </div>
                </div>
                
                {plate.highest_bid ? (
                  <div className="p-4 rounded-lg bg-auction-primary/10 border border-auction-primary/30">
                    <div className="text-center">
                      <div className="text-sm text-auction-primary mb-1">Current highest bid</div>
                      <div className="text-3xl font-bold text-auction-primary">
                        ${plate.highest_bid}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted border">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">No bids yet</div>
                      <div className="text-xl font-medium">Be the first to place a bid!</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <BidsList bids={plate.bids} />
          </div>
          
          <div>
            {user ? (
              <PlaceBidForm
                currentHighestBid={plate.highest_bid}
                plateId={plate.id}
                isActive={isActive}
                deadline={plate.deadline}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Place a Bid</CardTitle>
                  <CardDescription>
                    You need to be logged in to place a bid
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Please log in or create an account to start bidding
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link to="/login">
                      <Button variant="default" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="outline" className="w-full">Register</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlateDetailPage;
