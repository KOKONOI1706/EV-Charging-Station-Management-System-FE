import { Outlet } from 'react-router-dom';
import { FloatingReservation } from './FloatingReservation';
import { Toaster } from './ui/sonner';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <FloatingReservation />
      <Toaster />
    </>
  );
}
