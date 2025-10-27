import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

export function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [error, setError] = useState<string>('');
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError('');

      console.log('Testing Supabase connection...');
      
      // Test 1: Simple connection test
      const { error: connectionError } = await supabase
        .from('stations')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Connection test failed: ${connectionError.message}`);
      }

      console.log('✅ Supabase connection successful');

      // Test 2: Fetch stations using SupabaseService
      console.log('Testing SupabaseService.fetchStations()...');
      const stationsData = await SupabaseService.fetchStations();
      
      console.log('✅ SupabaseService.fetchStations() successful');
      console.log('📊 Fetched stations:', stationsData.length);
      
      setStations(stationsData);
      setConnectionStatus('connected');

    } catch (err: any) {
      console.error('❌ Database connection error:', err);
      setError(err.message || 'Unknown error');
      setConnectionStatus('failed');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄';
      case 'connected': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🗄️ Database Connection Test</h2>
      
      <div className={`text-lg font-medium mb-4 ${getStatusColor()}`}>
        {getStatusIcon()} Status: {connectionStatus.toUpperCase()}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-red-800 font-medium">❌ Error Details:</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <h3 className="text-green-800 font-medium">✅ Connection Successful!</h3>
          <p className="text-green-700 mt-1">
            Successfully connected to Supabase database.
          </p>
          <p className="text-green-700">
            Found {stations.length} charging stations in database.
          </p>
        </div>
      )}

      {stations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-800 font-medium">📊 Sample Data:</h3>
          <div className="mt-2 space-y-2">
            {stations.slice(0, 3).map((station, index) => (
              <div key={station.id} className="text-sm text-blue-700">
                {index + 1}. {station.name} - {station.address} ({station.status})
              </div>
            ))}
            {stations.length > 3 && (
              <div className="text-sm text-blue-600">
                ... and {stations.length - 3} more stations
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={testConnection}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={connectionStatus === 'testing'}
        >
          {connectionStatus === 'testing' ? '🔄 Testing...' : '🔄 Test Again'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">🔧 Configuration Info:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Supabase URL: {(import.meta as any).env?.VITE_SUPABASE_URL || 'Not configured'}</div>
          <div>Anon Key: {(import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</div>
        </div>
      </div>
    </div>
  );
}