import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useLanguage } from "../hooks/useLanguage";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userPhone: string;
  onUpdate: (name: string, email: string, phone: string) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  userPhone,
  onUpdate
}: ProfileModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    phone: userPhone
  });
  const [isLoading, setIsLoading] = useState(false);

<<<<<<< Updated upstream
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
=======
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    vehicleMake: user?.vehicleInfo?.make || "",
    vehicleModel: user?.vehicleInfo?.model || "",
    vehicleYear: user?.vehicleInfo?.year?.toString() || "",
    batteryCapacity: user?.vehicleInfo?.batteryCapacity?.toString() || ""
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.user_id) return;

    setIsLoading(true);
    try {
      // Call AuthService directly for profile update
      const updatedUser = await AuthService.updateProfile(user.user_id, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        vehicleInfo: {
          make: profileForm.vehicleMake,
          model: profileForm.vehicleModel,
          year: parseInt(profileForm.vehicleYear) || new Date().getFullYear(),
          batteryCapacity: parseFloat(profileForm.batteryCapacity) || 0
        }
      });

      // Update global context
      await updateUser(updatedUser);
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
>>>>>>> Stashed changes
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    
    try {
<<<<<<< Updated upstream
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
=======
      await AuthService.changePassword(
        user.user_id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
>>>>>>> Stashed changes
      
      // Call parent update handler
      onUpdate(formData.name, formData.email, formData.phone);
      
      toast.success(t.profileUpdated || "Profile updated successfully");
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t.profileUpdateFailed || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< Updated upstream
=======
  const handleResetForm = () => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      vehicleMake: user?.vehicleInfo?.make || "",
      vehicleModel: user?.vehicleInfo?.model || "",
      vehicleYear: user?.vehicleInfo?.year?.toString() || "",
      batteryCapacity: user?.vehicleInfo?.batteryCapacity?.toString() || ""
    });
    setIsEditing(false);
  };

  const handleClose = () => {
    handleResetForm();
    setShowPasswordChange(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    onClose();
  };

  if (!user) return null;

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

>>>>>>> Stashed changes
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.editProfile}</DialogTitle>
        </DialogHeader>
<<<<<<< Updated upstream
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.fullName}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? t.saving || "Saving..." : t.saveChanges || "Save Changes"}
            </Button>
          </div>
        </form>
=======

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-green-600 text-white text-lg">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getRoleBadgeColor(user.role || 'customer')}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details here
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isEditing ? handleResetForm() : setIsEditing(true)}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicle" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vehicle Information</CardTitle>
                      <CardDescription>
                        Update your electric vehicle details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-make">Make</Label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="vehicle-make"
                          value={profileForm.vehicleMake}
                          onChange={(e) => setProfileForm({ ...profileForm, vehicleMake: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle-model">Model</Label>
                      <Input
                        id="vehicle-model"
                        value={profileForm.vehicleModel}
                        onChange={(e) => setProfileForm({ ...profileForm, vehicleModel: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-year">Year</Label>
                      <Input
                        id="vehicle-year"
                        type="number"
                        min="2010"
                        max="2025"
                        value={profileForm.vehicleYear}
                        onChange={(e) => setProfileForm({ ...profileForm, vehicleYear: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="battery-capacity">Battery Capacity (kWh)</Label>
                      <Input
                        id="battery-capacity"
                        type="number"
                        min="10"
                        max="200"
                        value={profileForm.batteryCapacity}
                        onChange={(e) => setProfileForm({ ...profileForm, batteryCapacity: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                    >
                      Change Password
                    </Button>
                  </div>

                  {showPasswordChange && (
                    <>
                      <Separator />
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                          >
                            {isLoading ? "Changing..." : "Change Password"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPasswordChange(false);
                              setPasswordForm({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: ""
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Stats */}
              {user.role === "customer" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-gray-600">Total Sessions</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">$0.00</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
>>>>>>> Stashed changes
      </DialogContent>
    </Dialog>
  );
}
