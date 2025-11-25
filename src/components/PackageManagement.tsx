/**
 * ========================================
 * PACKAGE MANAGEMENT COMPONENT
 * ========================================
 * Component quản lý các gói dịch vụ/membership (Admin only)
 * 
 * Chức năng:
 * - Hiển thị danh sách tất cả gói dịch vụ
 * - Thêm gói mới với thông tin đầy đủ
 * - Chỉnh sửa gói đã có
 * - Xóa gói (soft delete - set status = Inactive)
 * - Tìm kiếm gói theo tên
 * - Phân trang kết quả
 * 
 * Thông tin gói dịch vụ:
 * - name: Tên gói (VD: "Premium", "Basic")
 * - description: Mô tả chi tiết
 * - price: Giá (VND)
 * - duration_days: Thời hạn (ngày)
 * - benefits: Các quyền lợi (JSON structure)
 * - status: Active/Inactive
 * 
 * Benefits structure có thể bao gồm:
 * - Giảm giá % cho mỗi lần sạc
 * - Số lượng sessions miễn phí
 * - Priority booking
 * - Free parking
 */

// Import React
import React, { useEffect, useState } from 'react';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

// Import package service
import {
  getPackages,      // Lấy danh sách gói
  createPackage,    // Tạo gói mới
  updatePackage,    // Cập nhật gói
  deletePackage,    // Xóa gói
  ServicePackage,   // Type definition
} from "../services/packageService";

// Import icons
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

/**
 * Component PackageManagement - Quản lý gói dịch vụ
 */
const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  interface FormData {
    name: string;
    description: string;
    price: string;
    duration_days: string;
    benefits: string;
    status: "Active" | "Inactive";
  }

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    duration_days: "",
    benefits: "",
    status: "Active",
  });

  // Fetch all packages
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPackages();
      setPackages(data);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải danh sách gói dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_days: "",
      benefits: "",
      status: "Active",
    });
    setEditingPackage(null);
    setIsDialogOpen(false);
  };

  interface BenefitsStructure {
    label: string;
    features: string[];
    max_sessions: number | null;
    discount_rate: number;
    charging_speed: string;
    priority_support: boolean;
    bonus_minutes: number;
    after_limit_discount: boolean;
    reward_points: number;
    free_start_fee: boolean;
    booking_priority: boolean;
    support_24_7: boolean;
    energy_tracking: boolean;
  }

  // Function to parse text input into benefits structure
  const parseBenefitsInput = (text: string): BenefitsStructure => {
    // Split by newlines and remove empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    let max_sessions: number | null = null;
    let discount_rate = 0;
    let charging_speed = '';
    let priority_support = false;
    let bonus_minutes = 0;
    let reward_points = 0;
    let after_limit_discount = false;
    let free_start_fee = false;
    let booking_priority = false;
    let support_24_7 = false;
    let energy_tracking = false;

    // Parse each line for specific information
    lines.forEach(line => {
      const lowerLine = line.toLowerCase().trim();
      if (lowerLine.includes('phiên sạc')) {
        if (lowerLine.includes('không giới hạn')) {
          max_sessions = null;
        } else {
          const match = line.match(/(\d+)/);
          if (match) {
            max_sessions = parseInt(match[1]);
          }
        }
      }
      if (lowerLine.includes('giảm') && lowerLine.includes('%')) {
        const match = line.match(/(\d+)%/);
        if (match) {
          discount_rate = parseInt(match[1]);
        }
      }
      if (lowerLine.includes('siêu nhanh')) {
        charging_speed = 'Ultra Fast (≤ 350kW)';
      } else if (lowerLine.includes('nhanh')) {
        charging_speed = 'Fast (≤ 60kW)';
      }
      
      // Parse priority support and 24/7
      if (lowerLine.includes('ưu tiên khách hàng')) {
        priority_support = true;
      }
      if (lowerLine.includes('24/7')) {
        support_24_7 = true;
      }

      // Parse bonus minutes
      if (lowerLine.includes('phút sạc miễn phí')) {
        const match = line.match(/(\d+)/);
        if (match) {
          bonus_minutes = parseInt(match[1]);
        }
      }

      // Parse reward points
      if (lowerLine.includes('điểm thưởng')) {
        const match = line.match(/(\d+)/);
        if (match) {
          reward_points = parseInt(match[1]);
        }
      }

      // Parse other benefits
      if (lowerLine.includes('hết lượt vẫn sạc với giá ưu đãi')) {
        after_limit_discount = true;
      }
      if (lowerLine.includes('miễn phí phí khởi động')) {
        free_start_fee = true;
      }
      if (lowerLine.includes('ưu tiên đặt lịch')) {
        booking_priority = true;
      }
      if (lowerLine.includes('theo dõi năng lượng')) {
        energy_tracking = true;
      }
    });

    return {
      label: "Standard",
      features: lines,
      max_sessions,
      discount_rate,
      charging_speed,
      priority_support,
      bonus_minutes,
      after_limit_discount,
      reward_points,
      free_start_fee,
      booking_priority,
      support_24_7,
      energy_tracking
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let benefitsData: BenefitsStructure;
    try {
      benefitsData = parseBenefitsInput(formData.benefits);
    } catch (err: any) {
      setError("Lỗi khi xử lý quyền lợi. Vui lòng kiểm tra lại định dạng.");
      return;
    }

    const data = {
      ...formData,
      price: Number(formData.price),
      duration_days: Number(formData.duration_days),
      benefits: benefitsData,
    };

    try {
      setLoading(true);
      setError(null);
      if (editingPackage) {
        await updatePackage(editingPackage.package_id, data);
      } else {
        await createPackage(data);
      }
      resetForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi lưu gói dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá gói này?")) return;
    try {
      setLoading(true);
      setError(null);
      await deletePackage(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Không thể xoá gói!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price.toString(),
      duration_days: pkg.duration_days?.toString() || "",
      benefits: pkg.benefits?.features?.join('\n') || "",
      status: pkg.status,
    });
    setIsDialogOpen(true);
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán số trang
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  
  // Lấy dữ liệu cho trang hiện tại
  const currentPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý gói dịch vụ</h1>
        <p className="text-gray-600">Quản lý các gói dịch vụ và giá cả</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle>Danh sách gói dịch vụ</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="w-8 h-8 border-2">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 2C1.22386 2 1 2.22386 1 2.5V12.5C1 12.7761 1.22386 13 1.5 13H13.5C13.7761 13 14 12.7761 14 12.5V2.5C14 2.22386 13.7761 2 13.5 2H1.5ZM2 3H13V12H2V3Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ghi chú cho admin</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm font-mono whitespace-pre bg-gray-50 p-4 rounded-md border border-gray-200 max-h-[80vh] overflow-y-auto">
{`=========================================
         HƯỚNG DẪN NHẬP QUYỀN LỢI GÓI
=========================================

Phần này giúp bạn nhập quyền lợi của gói dịch vụ 
sao cho hệ thống hiểu đúng.

Vui lòng ghi đúng theo mẫu bên dưới, chỉ thay:
- Số lượng phiên sạc
- Phần trăm giảm giá
- Tốc độ sạc (nhanh / siêu nhanh)
- Hỗ trợ ưu tiên (có / không)

-----------------------------------------
              CÁCH GHI ĐÚNG MẪU
-----------------------------------------

1. Số phiên sạc/tháng:
   - Ghi theo mẫu: X phiên sạc/tháng
   - Ví dụ: 25 phiên sạc/tháng

2. Giảm phí sạc (%):
   - Ghi theo mẫu: Giảm X% phí sạc
   - Ví dụ: Giảm 10% phí sạc

3. Tốc độ sạc:
   - Cách 1: Tốc độ sạc nhanh
   - Cách 2: Tốc độ sạc siêu nhanh

4. Hỗ trợ ưu tiên:
   - Cách 1: Hỗ trợ ưu tiên khách hàng
   - Cách 2: Không hỗ trợ ưu tiên khách hàng

5. Phút sạc miễn phí:
   - Ghi theo mẫu: Tặng X phút sạc miễn phí
   - Ví dụ: Tặng 30 phút sạc miễn phí

6. Điểm thưởng hàng tháng:
   - Ghi theo mẫu: Tặng X điểm thưởng mỗi tháng
   - Ví dụ: Tặng 100 điểm thưởng mỗi tháng

7. Các quyền lợi đặc biệt (ghi chính xác):
   - Hết lượt vẫn sạc với giá ưu đãi
   - Miễn phí phí khởi động
   - Ưu tiên đặt lịch sạc
   - Hỗ trợ 24/7
   - Theo dõi năng lượng tiêu thụ


-----------------------------------------
             LƯU Ý QUAN TRỌNG
-----------------------------------------

1. Không đổi thứ tự từ trong câu:
   ✅ Đúng: Giảm 10% phí sạc
   ❌ Sai:  Phí sạc giảm 10%

2. Không thêm ký tự hay biểu tượng:
   ✅ Đúng: Giảm 10% phí sạc
   ❌ Sai:  Giảm 10% phí sạc!!!

3. Mỗi quyền lợi viết trên 1 dòng riêng

4. Luôn ghi đầy đủ dấu %:
   ✅ Đúng: Giảm 10% phí sạc
   ❌ Sai:  Giảm 10 phí sạc

5. Chỉ dùng 2 cụm từ về tốc độ:
   ✅ Đúng: Tốc độ sạc nhanh
   ✅ Đúng: Tốc độ sạc siêu nhanh
   ❌ Sai:  Sạc cực nhanh
   ❌ Sai:  Nhanh siêu cấp

-----------------------------------------
              VÍ DỤ ĐẦY ĐỦ
-----------------------------------------

[Gói Tiêu Chuẩn]
25 phiên sạc/tháng
Tốc độ sạc nhanh
Giảm 5% phí sạc
Tặng 30 phút sạc miễn phí
Tặng 50 điểm thưởng mỗi tháng
Miễn phí phí khởi động
Hỗ trợ ưu tiên khách hàng

[Gói Cao Cấp]
50 phiên sạc/tháng
Tốc độ sạc siêu nhanh
Giảm 10% phí sạc
Tặng 60 phút sạc miễn phí
Tặng 100 điểm thưởng mỗi tháng
Hết lượt vẫn sạc với giá ưu đãi
Miễn phí phí khởi động
Ưu tiên đặt lịch sạc
Hỗ trợ 24/7
Theo dõi năng lượng tiêu thụ

=========================================
    CHỈ CẦN GHI ĐÚNG MẪU - HỆ THỐNG TỰ HIỂU
=========================================`}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder=" Tìm kiếm theo tên gói..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setEditingPackage(null);
                      resetForm();
                    }}
                  >
                    Thêm gói mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPackage ? "Cập nhật gói dịch vụ" : "Thêm gói dịch vụ mới"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Tên gói"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Giá"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Thời hạn (ngày)"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    />
                    <Textarea
                      placeholder="Mô tả"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <Textarea
                      placeholder="Nhập quyền lợi"
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    />
                    <Select
                      value={formData.status}
                      onValueChange={(value: string) => setFormData({ ...formData, status: value as "Active" | "Inactive" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Huỷ
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : editingPackage ? (
                          "Cập nhật"
                        ) : (
                          "Thêm mới"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div>
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-[15%] font-semibold">Tên gói</TableHead>
                    <TableHead className="w-[22%] font-semibold">Mô tả</TableHead>
                    <TableHead className="w-[13%] font-semibold">Giá</TableHead>
                    <TableHead className="w-[10%] font-semibold">Thời hạn</TableHead>
                    <TableHead className="w-[20%] font-semibold">Quyền lợi</TableHead>
                    <TableHead className="w-[10%] font-semibold">Trạng thái</TableHead>
                    <TableHead className="w-[10%] font-semibold text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Không tìm thấy gói phù hợp
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPackages.map((pkg) => (
                    <TableRow key={pkg.package_id}>
                      <TableCell className="font-medium w-[15%]">
                        <div className="truncate">{pkg.name}</div>
                      </TableCell>
                      <TableCell className="w-[22%]">
                        <div className="truncate" title={pkg.description}>{pkg.description}</div>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold w-[13%]">
                        <div className="truncate">{pkg.price.toLocaleString()}đ</div>
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <div className="truncate">{pkg.duration_days} ngày</div>
                      </TableCell>
                      <TableCell className="text-sm relative group w-[20%]">
                        <div className="max-w-[120px] truncate" title={pkg.benefits?.features?.join(", ")}>
                          {pkg.benefits?.features?.length ? 
                            (pkg.benefits.features[0].length > 20 
                              ? pkg.benefits.features[0].substring(0, 20) + "..."
                              : pkg.benefits.features[0]) + 
                            (pkg.benefits.features.length > 1 ? ", ..." : "")
                            : "-"}
                        </div>
                        {pkg.benefits?.features?.length > 1 && (
                          <div className="invisible group-hover:visible absolute z-50 bg-black text-white text-sm rounded p-2 w-48 left-0 mt-1 shadow-lg">
                            {pkg.benefits.features.join("\n")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          pkg.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.status}
                        </span>
                      </TableCell>
                      <TableCell className="w-[10%] text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pkg)}
                            className="px-2 py-1 min-w-[60px]"
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(pkg.package_id)}
                            className="px-2 py-1 min-w-[60px]"
                          >
                            Xoá
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-sm text-gray-600">
                  Hiển thị {Math.min(currentPage * itemsPerPage, filteredPackages.length)} / {filteredPackages.length} gói
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-green-600' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageManagement;