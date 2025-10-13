import AdminHeader from "../ui/adminHeader";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
