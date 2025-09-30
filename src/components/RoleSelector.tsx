import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Shield, Users } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

interface RoleSelectorProps {
  onRoleSelect: (role: "customer" | "staff" | "admin") => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const { t } = useLanguage();

  const roles = [
    {
      id: "customer" as const,
      name: "Customer",
      description: "Book charging sessions and manage your EV charging needs",
      icon: User,
      color: "bg-blue-100 text-blue-700",
      demo: {
        name: "Alex Johnson",
        email: "alex.johnson@email.com"
      }
    },
    {
      id: "staff" as const,
      name: "Staff",
      description: "Manage stations, bookings, and provide customer support",
      icon: Users,
      color: "bg-green-100 text-green-700",
      demo: {
        name: "Sarah Martinez",
        email: "sarah.martinez@chargetech.com"
      }
    },
    {
      id: "admin" as const,
      name: "Administrator",
      description: "Full system access, user management, and analytics",
      icon: Shield,
      color: "bg-purple-100 text-purple-700",
      demo: {
        name: "Michael Chen",
        email: "michael.chen@chargetech.com"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            ChargeTech <span className="text-green-600">Demo</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to explore the different interfaces and features available in our EV charging platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card key={role.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{role.name}</CardTitle>
                  <p className="text-gray-600">{role.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Demo User:</h4>
                    <p className="text-sm font-medium">{role.demo.name}</p>
                    <p className="text-sm text-gray-600">{role.demo.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.id === "customer" && (
                        <>
                          <Badge variant="secondary">Station Finder</Badge>
                          <Badge variant="secondary">Booking System</Badge>
                          <Badge variant="secondary">User Dashboard</Badge>
                        </>
                      )}
                      {role.id === "staff" && (
                        <>
                          <Badge variant="secondary">Station Management</Badge>
                          <Badge variant="secondary">Booking Management</Badge>
                          <Badge variant="secondary">Customer Support</Badge>
                        </>
                      )}
                      {role.id === "admin" && (
                        <>
                          <Badge variant="secondary">User Management</Badge>
                          <Badge variant="secondary">Analytics</Badge>
                          <Badge variant="secondary">System Settings</Badge>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => onRoleSelect(role.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Sign in as {role.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            This is a demonstration of the ChargeTech platform. All data is simulated for demo purposes.
          </p>
        </div>
      </div>
    </div>
  );
}