/**
 * ========================================
 * USER MANAGEMENT COMPONENT
 * ========================================
 * Component quản lý người dùng (dành cho Admin)
 * 
 * Chức năng:
 * - Hiển thị danh sách tất cả người dùng
 * - Thêm người dùng mới
 * - Chỉnh sửa thông tin người dùng
 * - Quản lý vai trò (role): Customer, Staff, Admin
 * - Quản lý trạng thái tài khoản (active/inactive)
 * - Xóa/vô hiệu hóa tài khoản
 * 
 * Phân quyền:
 * - Chỉ Admin mới có quyền truy cập component này
 * - Admin có thể thay đổi role của user khác
 * - Không được tự xóa tài khoản admin của mình
 */

// Import React
import React from 'react';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";

/**
 * Component UserManagement
 * Hiển thị giao diện quản lý người dùng dạng bảng
 */
const UserManagement: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
        <p className="text-gray-600">Quản lý thông tin và quyền hạn của người dùng</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách người dùng</CardTitle>
            <Button className="bg-green-600 hover:bg-green-700">Thêm người dùng</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add your table rows here */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;