/**
 * ===============================================================
 * INTERACTIVE STATION LAYOUT (SƠ ĐỒ TRẠM TƯƠNG TÁC)
 * ===============================================================
 * Component cho phép Admin/Staff tạo và chỉnh sửa layout trạm sạc 2D
 * 
 * Chức năng:
 * - 🗺️ Drag-and-drop charging points và facilities trên canvas 2D
 * - ➕ Thêm charging points mới (tạo trong DB + hiển thị trên layout)
 * - ✏️ Chỉnh sửa vị trí, power, connector type
 * - 🗑️ Xóa charging points
 * - 🏢 Thêm facilities (restroom, cafe, shop, parking)
 * - 💾 Lưu layout vào DB (pos_x, pos_y của mỗi point)
 * - 🔄 Auto-refresh status mỗi 30s
 * - 👁️ Read-only mode cho Staff (chỉ xem, không edit)
 * 
 * Props:
 * - stationId: UUID của station
 * - isReadOnly: Boolean (true = Staff view, false = Admin edit mode)
 * - onChargingPointClick: Callback khi click point (đặt chỗ)
 * 
 * Node types:
 * 1. ChargingPointNode:
 *    - Hiển thị thông tin: Name, status, power, connector
 *    - Màu sắc theo status (Available=Green, InUse=Red, etc.)
 *    - Draggable (nếu không read-only)
 *    - Click để edit hoặc đặt chỗ
 * 
 * 2. FacilityNode:
 *    - Hiển thị icon + label (🚻 Restroom, ☕ Cafe, etc.)
 *    - Màu sắc theo type
 *    - Draggable (nếu không read-only)
 * 
 * Layout storage:
 * - Mỗi charging point có pos_x, pos_y trong DB
 * - Facilities lưu trong stations.layout JSON field
 * - Format: { facilities: [{ id, type, name, pos_x, pos_y }] }
 * 
 * ReactFlow integration:
 * - Sử dụng ReactFlow library cho drag-and-drop
 * - Nodes: Charging points + Facilities
 * - Edges: Không có (chỉ cần nodes)
 * - Controls: Zoom, pan, fit view
 * - Background: Dot grid
 * - MiniMap: Overview của layout
 * 
 * Edit mode features:
 * - Add Point button: Mở form nhập name, power, connector
 * - Add Facility button: Chọn type từ dropdown
 * - Edit button trên mỗi node: Mở edit modal
 * - Delete button: Xác nhận trước khi xóa
 * - Save button: Gọi API cập nhật pos_x, pos_y
 * 
 * Status colors:
 * - Available: Green (#10b981)
 * - InUse: Red (#f63b3b)
 * - Maintenance: Orange (#f59e0b)
 * - Offline: Gray (#6b7280)
 * - Reserved: Purple (#8b5cf6)
 * 
 * Dependencies:
 * - ReactFlow: Drag-and-drop canvas
 * - chargingPointsApi: CRUD charging points
 * - stationApi: Update layout JSON
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeProps,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import {
  Save,
  Plus,
  ZapIcon,
  Edit2,
  X,
  Grid3x3,
  RefreshCw,
} from 'lucide-react';
import {
  getStationChargingPoints,
  createChargingPoint,
  updateChargingPoint,
  deleteChargingPoint,
  getConnectorTypes,
  type ChargingPoint as ApiChargingPoint,
  type ConnectorType,
} from '../api/chargingPointsApi';

// Status colors for charging points
const STATUS_COLORS = {
  Available: { bg: '#10b981', border: '#059669', text: '#ffffff' },
  InUse: { bg: '#f63b3bff', border: '#ff0000ff', text: '#ffffff' },
  Maintenance: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
  Offline: { bg: '#6b7280', border: '#4b5563', text: '#ffffff' },
  Reserved: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
};

// Facility colors and icons
const FACILITY_COLORS = {
  restroom: { bg: '#93c5fd', border: '#3b82f6', text: '#1e3a8a', label: '🚻 Restroom' },
  cafe: { bg: '#fdba74', border: '#f97316', text: '#7c2d12', label: '☕ Cafe' },
  shop: { bg: '#c4b5fd', border: '#8b5cf6', text: '#4c1d95', label: '🏪 Shop' },
  parking: { bg: '#86efac', border: '#22c55e', text: '#14532d', label: '🅿️ Parking' },
};

type FacilityType = 'restroom' | 'cafe' | 'shop' | 'parking';

interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  pos_x: number;
  pos_y: number;
}

interface ChargingPointNodeData {
  point: ApiChargingPoint;
  onEdit: (point: ApiChargingPoint) => void;
  onDelete: (pointId: number) => void;
  onClick?: (point: ApiChargingPoint) => void;
  isReadOnly?: boolean;
}

interface FacilityNodeData {
  facility: Facility;
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string) => void;
  isReadOnly?: boolean;
}

// Custom Node Component for Facilities
function FacilityNode({ data }: NodeProps<FacilityNodeData>) {
  const { facility, onEdit, onDelete, isReadOnly } = data;
  const colors = FACILITY_COLORS[facility.type];

  return (
    <div
      className="facility-node"
      style={{
        backgroundColor: colors.bg,
        border: `3px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '140px',
        minHeight: '100px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: isReadOnly ? 'default' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isReadOnly) return; // Disable context menu in read-only mode
        if (window.confirm(`Delete facility "${facility.name}"?`)) {
          onDelete(facility.id);
        }
      }}
    >
      <div style={{ color: colors.text, textAlign: 'center' }}>
        <div className="text-2xl mb-2">{colors.label.split(' ')[0]}</div>
        <div className="font-bold text-sm mb-1">{facility.name}</div>
        <div className="text-xs opacity-80">{facility.type}</div>
        {!isReadOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(facility);
            }}
            className="mt-2 p-1 hover:bg-white/20 rounded"
            style={{ color: colors.text }}
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// Custom Node Component for Charging Points
function ChargingPointNode({ data }: NodeProps<ChargingPointNodeData>) {
  const { point, onEdit, onDelete, onClick, isReadOnly } = data;
  const colors = STATUS_COLORS[point.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.Offline;

  return (
    <div
      className="charging-point-node"
      style={{
        backgroundColor: colors.bg,
        border: `3px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '12px',
        minWidth: '160px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: isReadOnly ? (onClick ? 'pointer' : 'default') : 'grab',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onClick={(e) => {
        if (isReadOnly && onClick) {
          e.stopPropagation();
          onClick(point);
        }
      }}
      onMouseEnter={(e) => {
        if (isReadOnly && onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (isReadOnly && onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isReadOnly) return; // Disable context menu in read-only mode
        if (window.confirm(`Delete charging point "${point.name}"?`)) {
          onDelete(point.point_id);
        }
      }}
    >
      <div style={{ color: colors.text }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ZapIcon className="w-5 h-5" />
            <span className="font-bold">{point.name}</span>
          </div>
          {!isReadOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(point);
              }}
              className="p-1 hover:bg-white/20 rounded"
              style={{ color: colors.text }}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-xs opacity-90 space-y-1">
          <div>{point.power_kw} kW</div>
          <div>{point.connector_type}</div>
          <div className="font-semibold">{point.status}</div>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  chargingPoint: ChargingPointNode,
  facility: FacilityNode,
};

interface InteractiveStationLayoutProps {
  stationId: string;
  stationName: string;
  isReadOnly?: boolean;
  facilities?: Facility[];
  onFacilitiesChange?: (facilities: Facility[]) => void;
  onChargingPointClick?: (point: ApiChargingPoint) => void;
}

export function InteractiveStationLayout({
  stationId,
  stationName,
  isReadOnly = false,
  facilities: externalFacilities = [],
  onFacilitiesChange,
  onChargingPointClick,
}: InteractiveStationLayoutProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);
  const [chargingPoints, setChargingPoints] = useState<ApiChargingPoint[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>(externalFacilities);
  const [connectorTypes, setConnectorTypes] = useState<ConnectorType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Edit Panel State - Charging Points
  const [editingPoint, setEditingPoint] = useState<ApiChargingPoint | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    power_kw: 150,
    connector_type_id: 1,
    status: 'Available',
    pos_x: 0,
    pos_y: 0,
  });

  // Edit Panel State - Facilities
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showFacilityPanel, setShowFacilityPanel] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'restroom' as FacilityType,
  });

  // Add Point/Facility State
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'point' | 'facility'>('point');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    loadChargingPoints();
    loadConnectorTypes();
  }, [stationId]);

  // Sync external facilities - use ref to prevent infinite loops
  const prevExternalFacilitiesRef = useRef<Facility[]>();
  useEffect(() => {
    // Only update if the actual content changed, not just the reference
    if (JSON.stringify(prevExternalFacilitiesRef.current) !== JSON.stringify(externalFacilities)) {
      setFacilities(externalFacilities);
      prevExternalFacilitiesRef.current = externalFacilities;
    }
  }, [externalFacilities]);

  // Convert charging points and facilities to React Flow nodes
  useEffect(() => {
    const newNodes: Node[] = [];
    
    // Add charging points
    chargingPoints.forEach((point, index) => {
      const x = point.pos_x ?? (index % 5) * 200 + 100;
      const y = point.pos_y ?? Math.floor(index / 5) * 150 + 100;

      newNodes.push({
        id: `point-${point.point_id}`,
        type: 'chargingPoint',
        position: { x, y },
        data: {
          point,
          onEdit: handleEditPoint,
          onDelete: handleDeletePoint,
          onClick: onChargingPointClick,
          isReadOnly, // Pass isReadOnly to node
        },
        draggable: !isReadOnly,
      });
    });

    // Add facilities
    facilities.forEach((facility, index) => {
      const x = facility.pos_x ?? 800 + (index % 3) * 180;
      const y = facility.pos_y ?? Math.floor(index / 3) * 150 + 100;

      newNodes.push({
        id: `facility-${facility.id}`,
        type: 'facility',
        position: { x, y },
        data: {
          facility,
          onEdit: handleEditFacility,
          onDelete: handleDeleteFacility,
          isReadOnly, // Pass isReadOnly to node
        },
        draggable: !isReadOnly,
      });
    });

    setNodes(newNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargingPoints, facilities, isReadOnly, onChargingPointClick]);

  // Sync form position changes to canvas
  useEffect(() => {
    if (editingPoint && showEditPanel) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === `point-${editingPoint.point_id}`) {
            return {
              ...node,
              position: { x: editForm.pos_x, y: editForm.pos_y },
            };
          }
          return node;
        })
      );
    }
  }, [editForm.pos_x, editForm.pos_y, editingPoint, showEditPanel]);

  const loadChargingPoints = async () => {
    try {
      setIsLoading(true);
      const points = await getStationChargingPoints(stationId);
      setChargingPoints(points);
    } catch (error) {
      console.error('Failed to load charging points:', error);
      toast.error('Failed to load charging points');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnectorTypes = async () => {
    try {
      const types = await getConnectorTypes();
      setConnectorTypes(types);
      if (types.length > 0 && !editForm.connector_type_id) {
        setEditForm((prev) => ({ ...prev, connector_type_id: types[0].connector_type_id }));
      }
    } catch (error) {
      console.error('Failed to load connector types:', error);
    }
  };

  // Handle node drag end - mark as unsaved
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      setHasUnsavedChanges(true);
      
      // If we're editing this node, update the form with new position
      if (editingPoint && node.id === `point-${editingPoint.point_id}`) {
        setEditForm(prev => ({
          ...prev,
          pos_x: Math.round(node.position.x),
          pos_y: Math.round(node.position.y),
        }));
      }
    },
    [editingPoint]
  );

  // Handle double-click to add new item
  const onPaneDoubleClick = useCallback(
    () => {
      if (isReadOnly) return;

      // Default to charging point
      setAddMode('point');
      setEditForm({
        name: `Point ${chargingPoints.length + 1}`,
        power_kw: 150,
        connector_type_id: connectorTypes[0]?.connector_type_id || 1,
        status: 'Available',
        pos_x: 100,
        pos_y: 100,
      });
      setShowAddForm(true);
      setShowEditPanel(false);
      setShowFacilityPanel(false);
    },
    [isReadOnly, chargingPoints.length, connectorTypes]
  );

  const handleEditPoint = useCallback((point: ApiChargingPoint) => {
    setEditingPoint(point);
    setEditForm({
      name: point.name,
      power_kw: point.power_kw,
      connector_type_id: point.connector_type_id || 1,
      status: point.status,
      pos_x: point.pos_x ?? 0,
      pos_y: point.pos_y ?? 0,
    });
    setShowEditPanel(true);
  }, []);

  const handleDeletePoint = useCallback(async (pointId: number) => {
    try {
      await deleteChargingPoint(pointId);
      toast.success('Charging point deleted');
      await loadChargingPoints();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to delete charging point:', error);
      toast.error('Failed to delete charging point');
    }
  }, []);

  // Facility handlers
  const handleEditFacility = useCallback((facility: Facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      type: facility.type,
    });
    setShowFacilityPanel(true);
    setShowEditPanel(false);
  }, []);

  const handleDeleteFacility = useCallback((facilityId: string) => {
    setFacilities((prevFacilities) => {
      const updatedFacilities = prevFacilities.filter(f => f.id !== facilityId);
      if (onFacilitiesChange) {
        onFacilitiesChange(updatedFacilities);
      }
      return updatedFacilities;
    });
    toast.success('Facility deleted');
    setHasUnsavedChanges(true);
  }, [onFacilitiesChange]);

  const handleSaveFacility = useCallback(() => {
    if (!editingFacility) return;

    setFacilities((prevFacilities) => {
      const updatedFacilities = prevFacilities.map(f =>
        f.id === editingFacility.id
          ? { ...f, name: facilityForm.name, type: facilityForm.type }
          : f
      );
      if (onFacilitiesChange) {
        onFacilitiesChange(updatedFacilities);
      }
      return updatedFacilities;
    });
    setShowFacilityPanel(false);
    setEditingFacility(null);
    toast.success('Facility updated');
    setHasUnsavedChanges(true);
  }, [editingFacility, facilityForm, onFacilitiesChange]);

  const handleAddFacility = useCallback(() => {
    setFacilities((prevFacilities) => {
      const newFacility: Facility = {
        id: `facility-${Date.now()}`,
        name: facilityForm.name || `${facilityForm.type} ${prevFacilities.length + 1}`,
        type: facilityForm.type,
        pos_x: 800,
        pos_y: 100 + prevFacilities.length * 150,
      };
      const updatedFacilities = [...prevFacilities, newFacility];
      if (onFacilitiesChange) {
        onFacilitiesChange(updatedFacilities);
      }
      return updatedFacilities;
    });
    setShowAddForm(false);
    toast.success('Facility added');
    setHasUnsavedChanges(true);
  }, [facilityForm, onFacilitiesChange]);

  const handleSaveEdit = async () => {
    if (!editingPoint) return;

    try {
      await updateChargingPoint(editingPoint.point_id, editForm);
      toast.success('Charging point updated');
      setShowEditPanel(false);
      setEditingPoint(null);
      await loadChargingPoints();
    } catch (error) {
      console.error('Failed to update charging point:', error);
      toast.error('Failed to update charging point');
    }
  };

  const handleAddPoint = async () => {
    try {
      await createChargingPoint({
        ...editForm,
        station_id: stationId,
      });
      toast.success('Charging point created');
      setShowAddForm(false);
      await loadChargingPoints();
    } catch (error) {
      console.error('Failed to create charging point:', error);
      toast.error('Failed to create charging point');
    }
  };

  const handleAdd = () => {
    if (addMode === 'point') {
      handleAddPoint();
    } else {
      handleAddFacility();
    }
  };

  // Save all positions to database
  const handleSaveLayout = async () => {
    try {
      setIsSaving(true);
      
      // Update charging points positions
      const pointUpdates = nodes
        .filter(node => node.id.startsWith('point-'))
        .map((node) => {
          const pointId = parseInt(node.id.replace('point-', ''));
          return updateChargingPoint(pointId, {
            pos_x: Math.round(node.position.x),
            pos_y: Math.round(node.position.y),
          });
        });

      await Promise.all(pointUpdates);

      // Update facilities positions
      const updatedFacilities = facilities.map(facility => {
        const node = nodes.find(n => n.id === `facility-${facility.id}`);
        if (node) {
          return {
            ...facility,
            pos_x: Math.round(node.position.x),
            pos_y: Math.round(node.position.y),
          };
        }
        return facility;
      });
      
      setFacilities(updatedFacilities);
      if (onFacilitiesChange) {
        onFacilitiesChange(updatedFacilities);
      }
      
      toast.success('Layout saved successfully');
      setHasUnsavedChanges(false);
      await loadChargingPoints();
    } catch (error) {
      console.error('Failed to save layout:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-arrange nodes in grid
  const handleAutoArrange = () => {
    const arrangedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 5) * 220 + 50,
        y: Math.floor(index / 5) * 180 + 50,
      },
    }));
    setNodes(arrangedNodes);
    setHasUnsavedChanges(true);
  };

  // Reset to saved positions
  const handleReset = () => {
    if (window.confirm('Reset to last saved positions?')) {
      loadChargingPoints();
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Interactive Layout Editor - {stationName}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isReadOnly
                  ? 'View charging points and facilities'
                  : 'Double-click to add • Right-click to delete • Drag to reposition'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              {!isReadOnly && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setAddMode('point');
                      setEditForm({
                        name: `Point ${chargingPoints.length + 1}`,
                        power_kw: 150,
                        connector_type_id: connectorTypes[0]?.connector_type_id || 1,
                        status: 'Available',
                        pos_x: 100,
                        pos_y: 100,
                      });
                      setShowAddForm(true);
                      setShowEditPanel(false);
                      setShowFacilityPanel(false);
                    }}
                  >
                    <ZapIcon className="w-4 h-4 mr-2" />
                    Add Point
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setAddMode('facility');
                      setFacilityForm({
                        name: '',
                        type: 'restroom',
                      });
                      setShowAddForm(true);
                      setShowEditPanel(false);
                      setShowFacilityPanel(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Facility
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAutoArrange}>
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Auto Arrange
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasUnsavedChanges}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSaveLayout}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Layout'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* React Flow Canvas */}
      <Card className="flex-1" style={{ minHeight: '600px' }}>
        <CardContent className="p-0 h-full">
          <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                onPaneClick={() => {
                  setShowEditPanel(false);
                  setShowAddForm(false);
                }}
                onDoubleClick={onPaneDoubleClick}
              >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    // Check if it's a charging point node
                    if (node.type === 'chargingPoint' && node.data && 'point' in node.data) {
                      const point = (node.data as ChargingPointNodeData).point;
                      return STATUS_COLORS[point.status as keyof typeof STATUS_COLORS]?.bg || '#6b7280';
                    }
                    // Check if it's a facility node
                    if (node.type === 'facility' && node.data && 'facility' in node.data) {
                      const facility = (node.data as FacilityNodeData).facility;
                      return FACILITY_COLORS[facility.type]?.bg || '#93c5fd';
                    }
                    return '#6b7280'; // Default gray
                  }}
                  nodeBorderRadius={12}
                />
                <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 m-4">
                  <div className="text-sm font-semibold mb-2">Charging Points</div>
                  <div className="space-y-1">
                    {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                      <div key={status} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: colors.bg }}
                        ></div>
                        <span className="text-xs">{status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-semibold mb-2">Facilities</div>
                    <div className="space-y-1">
                      {Object.entries(FACILITY_COLORS).map(([type, colors]) => (
                        <div key={type} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: colors.bg }}
                          ></div>
                          <span className="text-xs">{colors.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                    <div>Points: {chargingPoints.length}</div>
                    <div>Facilities: {facilities.length}</div>
                  </div>
                </Panel>
              </ReactFlow>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Point Panel */}
      {showEditPanel && editingPoint && (
        <div className="fixed right-4 top-20 w-80 z-50">
          <Card className="border-2 border-blue-500 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Charging Point
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditPanel(false);
                    setEditingPoint(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Point Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Power (kW)</Label>
                  <Input
                    type="number"
                    value={editForm.power_kw}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, power_kw: parseInt(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label>Connector</Label>
                  <Select
                    value={editForm.connector_type_id.toString()}
                    onValueChange={(value: string) =>
                      setEditForm((prev) => ({ ...prev, connector_type_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {connectorTypes.map((type) => (
                        <SelectItem key={type.connector_type_id} value={type.connector_type_id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: string) => setEditForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="InUse">In Use</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Position X</Label>
                  <Input
                    type="number"
                    value={editForm.pos_x}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, pos_x: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label>Position Y</Label>
                  <Input
                    type="number"
                    value={editForm.pos_y}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, pos_y: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 px-1">
                💡 Tip: You can also drag the node on the canvas to change position
              </div>
              <Button onClick={handleSaveEdit} className="w-full bg-blue-600 hover:bg-blue-700">
                Update Point
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Point/Facility Panel */}
      {showAddForm && (
        <div className="fixed right-4 top-20 w-80 z-50">
          <Card className="border-2 border-green-500 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {addMode === 'point' ? 'Add Charging Point' : 'Add Facility'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {addMode === 'point' ? (
                <>
                  <div>
                    <Label>Point Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Power (kW)</Label>
                  <Input
                    type="number"
                    value={editForm.power_kw}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, power_kw: parseInt(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label>Connector</Label>
                  <Select
                    value={editForm.connector_type_id.toString()}
                    onValueChange={(value: string) =>
                      setEditForm((prev) => ({ ...prev, connector_type_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {connectorTypes.map((type) => (
                        <SelectItem key={type.connector_type_id} value={type.connector_type_id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: string) => setEditForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Use">In Use</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                {addMode === 'point' ? 'Add Point' : 'Add Facility'}
              </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label>Facility Name</Label>
                    <Input
                      value={facilityForm.name}
                      onChange={(e) => setFacilityForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Main Restroom"
                    />
                  </div>
                  <div>
                    <Label>Facility Type</Label>
                    <Select
                      value={facilityForm.type}
                      onValueChange={(value: FacilityType) => setFacilityForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restroom">🚻 Restroom</SelectItem>
                        <SelectItem value="cafe">☕ Cafe</SelectItem>
                        <SelectItem value="shop">🏪 Shop</SelectItem>
                        <SelectItem value="parking">🅿️ Parking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Facility
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Facility Edit Panel */}
      {showFacilityPanel && editingFacility && (
        <div className="fixed right-4 top-20 w-80 z-50">
          <Card className="border-2 border-orange-500 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Facility
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFacilityPanel(false);
                    setEditingFacility(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Facility Name</Label>
                <Input
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Facility Type</Label>
                <Select
                  value={facilityForm.type}
                  onValueChange={(value: FacilityType) => setFacilityForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restroom">🚻 Restroom</SelectItem>
                    <SelectItem value="cafe">☕ Cafe</SelectItem>
                    <SelectItem value="shop">🏪 Shop</SelectItem>
                    <SelectItem value="parking">🅿️ Parking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveFacility} className="w-full bg-orange-600 hover:bg-orange-700">
                Update Facility
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
