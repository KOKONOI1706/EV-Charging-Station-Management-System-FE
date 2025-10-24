import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { StartChargingModal } from '../components/StartChargingModal';
import { ActiveChargingSession } from '../components/ActiveChargingSession';
import { ChargingHistory } from '../components/ChargingHistory';
import { 
  Zap, 
  Battery, 
  MapPin, 
  Gauge,
  Play,
  History,
  Activity
} from 'lucide-react';

export default function ChargingSessionTestPage() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'start' | 'active' | 'history'>('start');

  // Mock data for demo
  const mockStation = {
    name: "Central Mall Charging Station",
    address: "123 Main Street, District 1, HCMC",
    pricePerKwh: 5000,
  };

  const mockChargingPoint = {
    id: 1,
    name: "Point #3",
    powerKw: 150,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-green-600" />
            Charging Session Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Test the complete charging session flow: Start → Monitor → Stop
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow">
          <Button
            variant={activeTab === 'start' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('start')}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Charging
          </Button>
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className="flex-1"
          >
            <Activity className="w-4 h-4 mr-2" />
            Active Session
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="flex-1"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Start Charging Tab */}
          {activeTab === 'start' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-green-600" />
                  Start New Charging Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Station Info */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Available Charging Point
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Station</p>
                      <p className="font-semibold text-lg">{mockStation.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{mockStation.address}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Charging Point</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Battery className="w-5 h-5 text-green-600" />
                        {mockChargingPoint.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4 text-gray-500" />
                          {mockChargingPoint.powerKw} kW
                        </span>
                        <span className="font-semibold text-green-700">
                          {mockStation.pricePerKwh.toLocaleString()} VND/kWh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium text-green-800">Point Available</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Ready to Charge
                  </Badge>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 How to Start:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Make sure your vehicle is properly connected to the charging point</li>
                    <li>Note the initial meter reading from the display</li>
                    <li>Click "Start Charging" button below</li>
                    <li>Enter the meter reading in the modal</li>
                    <li>Confirm to begin charging</li>
                  </ol>
                </div>

                {/* Action Button */}
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  onClick={() => setShowStartModal(true)}
                >
                  <Zap className="w-6 h-6 mr-3" />
                  Start Charging Session
                </Button>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">150 kW</p>
                    <p className="text-xs text-gray-500">Max Power</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">~45 min</p>
                    <p className="text-xs text-gray-500">Typical Duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">Type 2</p>
                    <p className="text-xs text-gray-500">Connector</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Session Tab */}
          {activeTab === 'active' && (
            <ActiveChargingSession
              onSessionEnd={() => {
                setActiveTab('history');
              }}
            />
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <ChargingHistory limit={10} />
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              💡 Quick Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">🔋 Meter Reading</h4>
                <p className="text-gray-600">
                  The meter reading is displayed on the charging point screen. 
                  Note it carefully before starting.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">💰 Cost Calculation</h4>
                <p className="text-gray-600">
                  Cost = (Energy Consumed × Price per kWh) + Idle Fees
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⏱️ Real-time Monitoring</h4>
                <p className="text-gray-600">
                  Switch to "Active Session" tab to monitor your charging progress.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🛑 Stop Charging</h4>
                <p className="text-gray-600">
                  Click "Stop Charging" when done. Final cost will be calculated automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Charging Modal */}
      {showStartModal && (
        <StartChargingModal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          pointId={mockChargingPoint.id}
          pointName={mockChargingPoint.name}
          stationName={mockStation.name}
          powerKw={mockChargingPoint.powerKw}
          pricePerKwh={mockStation.pricePerKwh}
          onSuccess={() => {
            setShowStartModal(false);
            setActiveTab('active');
          }}
        />
      )}
    </div>
  );
}
