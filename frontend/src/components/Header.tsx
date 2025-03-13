
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";

export const Header = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="bg-auction-primary text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Auto Plate Bidding</Link>
        
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-amber-300 transition-colors">Home</Link>
          {user && (
            <>
              <Link to="/my-bids" className="hover:text-amber-300 transition-colors">My Bids</Link>
              {isAdmin && (
                <Link to="/admin" className="hover:text-amber-300 transition-colors">Admin Dashboard</Link>
              )}
            </>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 border border-white/30">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 border-b">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{isAdmin ? 'Administrator' : 'User'}</p>
                </div>
                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:text-amber-300 hover:bg-auction-primary/80">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-auction-accent text-auction-dark hover:bg-amber-400">Register</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
