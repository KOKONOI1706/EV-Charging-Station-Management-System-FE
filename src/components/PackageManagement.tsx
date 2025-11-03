import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  ServicePackage,
} from "../services/packageService";
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
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
  }

  // Function to parse text input into benefits structure
  const parseBenefitsInput = (text: string): BenefitsStructure => {
    // Split by newlines and remove empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    let max_sessions: number | null = null;
    let discount_rate = 0;
    let charging_speed = '';
    let priority_support = false;

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
      if (lowerLine.includes('24/7') || lowerLine.includes('ưu tiên')) {
        priority_support = true;
      }
    });

    return {
      label: "Standard",
      features: lines,
      max_sessions,
      discount_rate,
      charging_speed,
      priority_support
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách gói dịch vụ</CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Quyền lợi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
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
                  filteredPackages.map((pkg) => (
                    <TableRow key={pkg.package_id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell className="truncate max-w-xs">
                        {pkg.description}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {pkg.price}đ
                      </TableCell>
                      <TableCell>{pkg.duration_days}</TableCell>
                      <TableCell className="text-sm">
                        {pkg.benefits?.features?.join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${
                          pkg.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(pkg.package_id)}
                        >
                          Xoá
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageManagement;