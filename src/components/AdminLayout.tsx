import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { AdminFooter } from './AdminFooter';

const AdminLayout = () => {
  return (
    <div className="h-screen bg-gray-100">
      <div className="flex flex-col h-full">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;