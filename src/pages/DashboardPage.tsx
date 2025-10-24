import { useEffect, useState } from "react";
import { UserDashboard } from "../components/UserDashboard";
import { useAuth } from "../contexts/AuthContext";
import { Booking, MockDatabaseService } from "../data/mockDatabase";

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        setBookings([]);
        return;
      }
      const userBookings = await MockDatabaseService.getUserBookings(user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <UserDashboard bookings={bookings} userName={user?.name || "User"} />;
}
