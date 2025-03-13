
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserBids } from "@/hooks/use-bids";
import { usePlates } from "@/hooks/use-plates";
import { Header } from "@/components/Header";
import { UserBidsList } from "@/components/UserBidsList";
import { ArrowLeft, Loader2 } from "lucide-react";

const UserBidsPage = () => {
  const { data: userBids, isLoading: isLoadingBids } = useUserBids();
  const { data: plates, isLoading: isLoadingPlates } = usePlates();
  const [plateNumbers, setPlateNumbers] = useState<Record<number, string>>({});
  const [highestBids, setHighestBids] = useState<Record<number, string | null>>({});
  
  useEffect(() => {
    if (plates) {
      const numbers: Record<number, string> = {};
      const bids: Record<number, string | null> = {};
      
      plates.forEach((plate) => {
        numbers[plate.id] = plate.plate_number;
        bids[plate.id] = plate.highest_bid || null;
      });
      
      setPlateNumbers(numbers);
      setHighestBids(bids);
    }
  }, [plates]);
  
  const isLoading = isLoadingBids || isLoadingPlates;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-auction-primary hover:underline inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to plates
          </Link>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-auction-primary mb-2">My Bids</h1>
            <p className="text-muted-foreground">
              View and manage all your active bids on auto plates
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-auction-primary" />
            </div>
          ) : userBids && userBids.length > 0 ? (
            <UserBidsList
              bids={userBids}
              plateNumbers={plateNumbers}
              highestBids={highestBids}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No Bids Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any bids on auto plates yet.
              </p>
              <Link to="/">
                <button className="bg-auction-primary text-white px-6 py-2 rounded-md hover:bg-auction-primary/90 transition-colors">
                  Browse Plates
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserBidsPage;
