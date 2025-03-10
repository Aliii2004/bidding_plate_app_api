
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const API_URL = "http://localhost:8000"; // Replace with your actual backend URL

const Index = () => {
  const [plates, setPlates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("deadline");
  const [userBids, setUserBids] = useState([]);
  const { toast } = useToast();

  // Login form schema
  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });

  // Bid form schema
  const bidSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
    plateId: z.number(),
  });

  // Form hooks
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const bidForm = useForm({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: "",
      plateId: 0,
    },
  });

  // Load plates on component mount and when search/filter changes
  useEffect(() => {
    fetchPlates();
  }, [searchTerm, orderBy]);

  // Load user bids if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserBids();
    }
  }, [isLoggedIn]);

  const fetchPlates = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/plates/`;
      if (searchTerm) {
        url += `&plate_numbercontains=${searchTerm}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch plates");
      }
      const data = await response.json();
      setPlates(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching plates:", err);
      setError("Failed to load plates. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load plates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBids = async () => {
    try {
      const response = await fetch(`${API_URL}/bids/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user bids");
      }
      
      const data = await response.json();
      setUserBids(data);
    } catch (err) {
      console.error("Error fetching user bids:", err);
      toast({
        title: "Error",
        description: "Failed to load your bids",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (values) => {
    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);
      
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      const data = await response.json();
      setToken(data.access_token);
      setIsLoggedIn(true);
      
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      
      loginForm.reset();
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsLoggedIn(false);
    setUserBids([]);
    toast({
      title: "Logged Out",
      description: "You have been logged out",
    });
  };

  const handleBid = async (values) => {

    try {
      const response = await fetch(`${API_URL}/bids/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(values.amount),
          plate_id: values.plateId,
        }),
      });

      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to place bid");
      }
      
      toast({
        title: "Bid Placed",
        description: "Your bid has been successfully placed",
      });
      
      // Refresh plates and user bids
      fetchPlates();
      fetchUserBids();
      bidForm.reset();
    } catch (err) {
      console.error("Bid error:", err);
      toast({
        title: "Bid Failed",
        description: err.message,
        variant: "destructive",
      });
    }

  };

  const openBidDialog = (plateId) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to place a bid",
        variant: "destructive",
      });
      return;
    }
    
    bidForm.setValue("plateId", plateId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric' as const, 
      month: 'short' as const, 
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if plate bidding is closed (deadline passed)
  const isBiddingClosed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Auto Plate Palooza</h1>
          <div>
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Login</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Login to Your Account</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to place bids on auto plates.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Login</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Bid on exclusive auto license plates - highest bid wins!
        </p>
      </header>

      <Tabs defaultValue="plates" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="plates">Available Plates</TabsTrigger>
          {isLoggedIn && <TabsTrigger value="mybids">My Bids</TabsTrigger>}
        </TabsList>

        <TabsContent value="plates">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search plate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value="deadline">Deadline (Ascending)</option>
                <option value="-deadline">Deadline (Descending)</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-destructive">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plates.length > 0 ? (
                plates.map((plate) => (
                  <Card key={plate.id} className={`${isBiddingClosed(plate.deadline) ? 'bg-muted/50' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{plate.plate_number}</span>
                        {isBiddingClosed(plate.deadline) && (
                          <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-1 rounded">Closed</span>
                        )}
                      </CardTitle>
                      <CardDescription>{plate.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Deadline:</span>
                        <span className="text-sm font-medium">{formatDate(plate.deadline)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Bid:</span>
                        <span className="text-sm font-medium">
                          {plate.highest_bid ? `$${parseFloat(plate.highest_bid).toFixed(2)}` : 'No bids yet'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            disabled={isBiddingClosed(plate.deadline)}
                            onClick={() => openBidDialog(plate.id)}
                          >
                            Place Bid
                          </Button>
                        </DialogTrigger>
                        {isLoggedIn && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Place a Bid</DialogTitle>
                              <DialogDescription>
                                You are bidding on plate number: <strong>{plate.plate_number}</strong><br />
                                Current highest bid: <strong>{plate.highest_bid ? `$${parseFloat(plate.highest_bid).toFixed(2)}` : 'No bids yet'}</strong>
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...bidForm}>
                              <form onSubmit={bidForm.handleSubmit(handleBid)} className="space-y-4">
                                <FormField
                                  control={bidForm.control}
                                  name="amount"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Your Bid Amount ($)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter amount" {...field} />
                                      </FormControl>
                                      <FormDescription>
                                        Your bid must be higher than the current highest bid.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <input type="hidden" {...bidForm.register("plateId")} />
                                <DialogFooter>
                                  <Button type="submit">Submit Bid</Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        )}
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center p-8 bg-muted/30 rounded-lg">
                  No plates found matching your criteria
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mybids">
          {userBids.length > 0 ? (
            <div className="space-y-4">
              {userBids.map((bid) => (
                <Card key={bid.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Bid #{bid.id}</CardTitle>
                    <CardDescription>
                      Placed on: {formatDate(bid.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Plate ID:</span>
                      <span className="text-sm font-medium">{bid.plate_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Your Bid:</span>
                      <span className="text-sm font-medium">${parseFloat(bid.amount).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              You haven't placed any bids yet
            </div>
          )}
        </TabsContent>
      </Tabs>

      <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; 2023 Auto Plate Palooza. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
