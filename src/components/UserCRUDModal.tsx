/**
 * ===============================================================
 * USER CRUD MODAL (TẠO/SỬA/XEM USER)
 * ===============================================================
 * Modal cho Admin quản lý users (Create/Edit/View)
 * 
 * Chức năng:
 * - ➕ Tạo user mới (mode='create')
 * - ✏️ Chỉnh sửa thông tin user (mode='edit')
 * - 👁️ Xem thông tin user (mode='view', read-only)
 * - ✅ Validation form đầy đủ
 * - 🔒 Phân quyền role: Customer/Staff/Admin
 * - 🔑 Nhập mật khẩu khi tạo mới
 * - 📧 Validate email format
 * - 📞 Validate số điện thoại (10 số)
 * 
 * Props:
 * - open: Boolean điều khiển hiển/ẩn modal
 * - onClose: Callback đóng modal
 * - user: User object (null nếu tạo mới)
 * - mode: 'create' | 'edit' | 'view'
 * - onSave: Callback sau khi save thành công
 * 
 * Form fields:
 * - name: Tên người dùng (required)
 * - email: Email (required, unique, format validation)
 * - phone: Số điện thoại (required, 10 số)
 * - role: Customer/Staff/Admin (dropdown)
 * - password: Mật khẩu (required khi create, optional khi edit)
 * - confirmPassword: Xác nhận mật khẩu (phải khớp)
 * 
 * Validation rules:
 * 1. Tên: Không được để trống
 * 2. Email: Không được để trống + format email hợp lệ
 * 3. Phone: 10 chữ số (chỉ cho phép số)
 * 4. Password (create mode):
 *    - Không được để trống
 *    - Ít nhất 6 ký tự
 *    - confirmPassword phải khớp
 * 5. Password (edit mode):
 *    - Optional (không bắt buộc đổi)
 *    - Nếu nhập: Ít nhất 6 ký tự + confirmPassword khớp
 * 
 * Mode behaviors:
 * - create: Tất cả fields editable, password required
 * - edit: Tất cả fields editable, password optional
 * - view: Tất cả fields read-only, không hiển password
 * 
 * Submit flow:
 * 1. Validate form
 * 2. Nếu mode=create:
 *    - Gọi usersApi.createUser()
 *    - Toast success: "Tạo user thành công"
 * 3. Nếu mode=edit:
 *    - Gọi usersApi.updateUser()
 *    - Toast success: "Cập nhật thành công"
 * 4. Gọi onSave() để refresh danh sách
 * 5. Đóng modal
 * 
 * Error handling:
 * - Hiển thị lỗi dưới mỗi field
 * - Toast error nếu API call thất bại
 * - Email duplicate: "Email đã tồn tại"
 * 
 * Dependencies:
 * - usersApi: CRUD operations
 * - toast (sonner): Thông báo
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { usersApi, type User } from '../api/usersApi';

interface UserCRUDModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  mode: 'create' | 'edit' | 'view';
  onSave: () => void;
}

export function UserCRUDModal({ open, onClose, user, mode, onSave }: UserCRUDModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as 'customer' | 'staff' | 'admin',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  }, [user, mode, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Mật khẩu không được để trống';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    if (mode === 'edit' && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        await usersApi.createUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password
        });
        toast.success('Tạo người dùng thành công');
      } else if (mode === 'edit' && user) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        await usersApi.updateUser(user.id, updateData);
        toast.success('Cập nhật người dùng thành công');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Thêm người dùng mới'}
            {mode === 'edit' && 'Chỉnh sửa người dùng'}
            {mode === 'view' && 'Xem thông tin người dùng'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                disabled={isViewMode}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                disabled={isViewMode}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
                disabled={isViewMode}
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isViewMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mật khẩu {mode === 'create' && '*'} {mode === 'edit' && '(để trống nếu không đổi)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Xác nhận mật khẩu {mode === 'create' && '*'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? 'Đóng' : 'Hủy'}
            </Button>
            {!isViewMode && (
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
