import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Car, Plus, Trash2, Edit, Battery, Calendar, Zap } from "lucide-react";
import { vehicleApi, Vehicle, ConnectorType } from "../api/vehicleApi";
import { AuthService } from "../services/authService";
import { toast } from "sonner";
import { useLanguage } from "../hooks/useLanguage";

export function VehicleManagement() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [connectorTypes, setConnectorTypes] = useState<ConnectorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [formData, setFormData] = useState({
    plate_number: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    battery_capacity_kwh: 0,
    connector_type_id: 0,
  });

  const currentUser = AuthService.getCurrentUser();

  // Load vehicles and connector types
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [vehiclesData, connectorTypesData] = await Promise.all([
        vehicleApi.getUserVehicles(parseInt(currentUser.id)),
        vehicleApi.getConnectorTypes(),
      ]);
      console.log("🚗 Vehicles loaded:", vehiclesData);
      console.log("🔌 Connector types loaded:", connectorTypesData);
      setVehicles(vehiclesData);
      setConnectorTypes(connectorTypesData);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const newVehicle = await vehicleApi.createVehicle({
        user_id: parseInt(currentUser.id),
        plate_number: formData.plate_number,
        make: formData.make || undefined,
        model: formData.model || undefined,
        year: formData.year || undefined,
        color: formData.color || undefined,
        battery_capacity_kwh: formData.battery_capacity_kwh || undefined,
        connector_type_id: formData.connector_type_id || undefined,
      });

      setVehicles([newVehicle, ...vehicles]);
      setIsAddModalOpen(false);
      resetForm();
      toast.success(t.vehicleAdded);
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      toast.error(error.message || "Failed to add vehicle");
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    try {
      const updatedVehicle = await vehicleApi.updateVehicle(
        selectedVehicle.vehicle_id,
        {
          plate_number: formData.plate_number,
          make: formData.make || undefined,
          model: formData.model || undefined,
          year: formData.year || undefined,
          color: formData.color || undefined,
          battery_capacity_kwh: formData.battery_capacity_kwh || undefined,
          connector_type_id: formData.connector_type_id || undefined,
        }
      );

      setVehicles(
        vehicles.map((v) =>
          v.vehicle_id === updatedVehicle.vehicle_id ? updatedVehicle : v
        )
      );
      setIsEditModalOpen(false);
      setSelectedVehicle(null);
      resetForm();
      toast.success(t.vehicleUpdated);
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      toast.error(error.message || "Failed to update vehicle");
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      await vehicleApi.deleteVehicle(selectedVehicle.vehicle_id);
      setVehicles(
        vehicles.filter((v) => v.vehicle_id !== selectedVehicle.vehicle_id)
      );
      setIsDeleteModalOpen(false);
      setSelectedVehicle(null);
      toast.success(t.vehicleDeleted);
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error(error.message || "Failed to delete vehicle");
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      plate_number: vehicle.plate_number,
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || "",
      battery_capacity_kwh: vehicle.battery_capacity_kwh || 0,
      connector_type_id: vehicle.connector_type_id || 0,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      plate_number: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      battery_capacity_kwh: 0,
      connector_type_id: 0,
    });
  };

  const getConnectorTypeName = (connectorTypeId?: number) => {
    if (!connectorTypeId) return "N/A";
    const connector = connectorTypes.find(
      (ct) => ct.connector_type_id === connectorTypeId
    );
    return connector?.name || "Unknown";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading vehicles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              {t.myVehicles}
            </CardTitle>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t.addVehicle}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {t.noVehiclesYet}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {t.addVehicleToStart}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.addVehicle}
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicle_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {vehicle.plate_number}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(vehicle)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(vehicle)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {(vehicle.make || vehicle.model) && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          {vehicle.year && `${vehicle.year} `}
                          {vehicle.make} {vehicle.model}
                        </span>
                      </div>
                    )}

                    {vehicle.color && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Color:</span>
                        <Badge variant="outline">{vehicle.color}</Badge>
                      </div>
                    )}

                    {vehicle.battery_capacity_kwh && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Battery className="w-4 h-4" />
                        {vehicle.battery_capacity_kwh} kWh
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Zap className="w-4 h-4" />
                      {getConnectorTypeName(vehicle.connector_type_id)}
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-xs pt-2 border-t">
                      <Calendar className="w-3 h-3" />
                      {t.added}:{" "}
                      {new Date(vehicle.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vehicle Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addVehicle}</DialogTitle>
            <DialogDescription>
              {t.enterVehicleDetails}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddVehicle}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="plate_number">
                  {t.plateNumber} *
                </Label>
                <Input
                  id="plate_number"
                  value={formData.plate_number}
                  onChange={(e) =>
                    setFormData({ ...formData, plate_number: e.target.value })
                  }
                  placeholder="ABC-1234"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">{t.make}</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    placeholder="Tesla"
                  />
                </div>
                <div>
                  <Label htmlFor="model">{t.model}</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder="Model 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">{t.year}</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    min={1990}
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <Label htmlFor="color">{t.color}</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="White"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="battery_capacity">
                  {t.batteryCapacity}
                </Label>
                <Input
                  id="battery_capacity"
                  type="number"
                  value={formData.battery_capacity_kwh || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      battery_capacity_kwh: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="75"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="connector_type">
                  {t.connectorType}
                </Label>
                <Select
                  value={formData.connector_type_id.toString()}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      connector_type_id: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select connector type" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectorTypes.map((ct) => (
                      <SelectItem
                        key={ct.connector_type_id}
                        value={ct.connector_type_id.toString()}
                      >
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                {t.cancel}
              </Button>
              <Button type="submit">{t.save2}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editVehicle}</DialogTitle>
            <DialogDescription>
              {t.enterVehicleDetails}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVehicle}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit_plate_number">
                  {t.plateNumber} *
                </Label>
                <Input
                  id="edit_plate_number"
                  value={formData.plate_number}
                  onChange={(e) =>
                    setFormData({ ...formData, plate_number: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_make">{t.make}</Label>
                  <Input
                    id="edit_make"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit_model">{t.model}</Label>
                  <Input
                    id="edit_model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_year">{t.year}</Label>
                  <Input
                    id="edit_year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    min={1990}
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_color">{t.color}</Label>
                  <Input
                    id="edit_color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_battery_capacity">
                  {t.batteryCapacity}
                </Label>
                <Input
                  id="edit_battery_capacity"
                  type="number"
                  value={formData.battery_capacity_kwh || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      battery_capacity_kwh: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="edit_connector_type">
                  {t.connectorType}
                </Label>
                <Select
                  value={formData.connector_type_id.toString()}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      connector_type_id: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select connector type" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectorTypes.map((ct) => (
                      <SelectItem
                        key={ct.connector_type_id}
                        value={ct.connector_type_id.toString()}
                      >
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedVehicle(null);
                  resetForm();
                }}
              >
                {t.cancel}
              </Button>
              <Button type="submit">{t.save2}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.deleteVehicle}</DialogTitle>
            <DialogDescription>
              {t.deleteVehicleConfirm}
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="py-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="font-semibold">{selectedVehicle.plate_number}</p>
                {(selectedVehicle.make || selectedVehicle.model) && (
                  <p className="text-sm text-gray-600">
                    {selectedVehicle.year} {selectedVehicle.make}{" "}
                    {selectedVehicle.model}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedVehicle(null);
              }}
            >
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

