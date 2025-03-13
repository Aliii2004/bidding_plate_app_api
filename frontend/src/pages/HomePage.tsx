
import { useState } from "react";
import { usePlates } from "@/hooks/use-plates";
import { Header } from "@/components/Header";
import { PlateCard } from "@/components/PlateCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SortAsc, SortDesc, Loader2 } from "lucide-react";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ordering, setOrdering] = useState<string | undefined>(undefined);
  const [currentSearch, setCurrentSearch] = useState("");
  
  const { data: plates, isLoading, isError, refetch } = usePlates({
    plate_number__contains: currentSearch,
    ordering,
  });
  
  const handleSearch = () => {
    setCurrentSearch(searchTerm);
  };
  
  const handleOrderingChange = (value: string) => {
    setOrdering(value === "none" ? undefined : value);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-auction-primary mb-4">
              Auto Plate Bidding Platform
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse and bid on exclusive auto plates. Find your perfect plate number and make it yours!
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 flex gap-2">
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
            
            <div className="w-full md:w-48">
              <Select
                value={ordering || "none"}
                onValueChange={handleOrderingChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No sorting</SelectItem>
                  <SelectItem value="deadline">
                    <div className="flex items-center">
                      <SortAsc className="mr-2 h-4 w-4" />
                      <span>Deadline (Asc)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="-deadline">
                    <div className="flex items-center">
                      <SortDesc className="mr-2 h-4 w-4" />
                      <span>Deadline (Desc)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        
        <section>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-auction-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-lg text-red-500 mb-4">Failed to load plates</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : plates && plates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plates.map((plate) => (
                <PlateCard key={plate.id} plate={plate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-2">No plates found</p>
              <p className="text-sm text-muted-foreground">
                {currentSearch ? `No results for "${currentSearch}"` : "There are no plates available at the moment."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
