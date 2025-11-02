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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.editProfile}</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
