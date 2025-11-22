import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Reservation, reservationService } from '../services/reservationService';
import { useAuth } from './AuthContext';

interface ReservationContextType {
  activeReservation: Reservation | null;
  setActiveReservation: (reservation: Reservation | null) => void;
  refreshReservation: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const { user } = useAuth();

  console.log('🔄 ReservationProvider render:', { 
    userId: user?.id, 
    hasActiveReservation: !!activeReservation,
    reservationId: activeReservation?.id 
  });

  // Load active reservation when user logs in
  useEffect(() => {
    if (user?.id) {
      console.log('🔍 Checking for active reservation for user:', user.id);
      const active = reservationService.getActiveReservationByUser(user.id.toString());
      if (active) {
        console.log('✅ Found active reservation:', active);
        setActiveReservation(active);
      } else {
        console.log('📭 No active reservation found');
        setActiveReservation(null);
      }
    } else {
      console.log('⚠️ No user logged in');
      setActiveReservation(null);
    }
  }, [user]);

  // Subscribe to reservation updates
  useEffect(() => {
    if (!user?.id) return;

    // Check for updates every second
    const interval = setInterval(() => {
      if (activeReservation) {
        const updated = reservationService.getReservation(activeReservation.id);
        if (updated && updated.status === 'active') {
          // Update the reservation with new remaining time
          setActiveReservation({ ...updated });
        } else if (!updated || updated.status !== 'active') {
          // Reservation is no longer active
          console.log('📭 Reservation no longer active, clearing...');
          setActiveReservation(null);
        }
      } else {
        // Check if there's a new active reservation
        const active = reservationService.getActiveReservationByUser(user.id.toString());
        if (active) {
          console.log('🆕 New active reservation detected:', active.id);
          setActiveReservation(active);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, activeReservation]);

  const refreshReservation = () => {
    if (user?.id) {
      const active = reservationService.getActiveReservationByUser(user.id.toString());
      setActiveReservation(active || null);
    }
  };

  return (
    <ReservationContext.Provider value={{ activeReservation, setActiveReservation, refreshReservation }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}
