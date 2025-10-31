import React, { useEffect, useState } from 'react';

interface ChargingSession {
  id: number;
  userId: number;
  stationId: number;
  startTime: string;
  endTime: string;
  energyUsed: number;
}

const ChargingSessionPage: React.FC = () => {
  const [data, setData] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/charging-sessions')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Charging Sessions</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Station ID</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Energy Used (kWh)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.userId}</td>
              <td>{item.stationId}</td>
              <td>{item.startTime}</td>
              <td>{item.endTime}</td>
              <td>{item.energyUsed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChargingSessionPage;
