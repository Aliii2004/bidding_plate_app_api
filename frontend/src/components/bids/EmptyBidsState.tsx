
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyBidsStateProps {
  title: string;
  description: string;
}

export const EmptyBidsState = ({ title, description }: EmptyBidsStateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-6 text-muted-foreground">You haven't placed any bids yet.</p>
      </CardContent>
    </Card>
  );
};
