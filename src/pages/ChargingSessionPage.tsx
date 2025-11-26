/*
========================================
CHARGING SESSION PAGE - Trang Phiên Sạc
========================================

Mô tả:
Trang hiển thị danh sách các phiên sạc xe (charging sessions) dưới dạng bảng.
Fetch data từ API /api/charging-sessions và render thông tin chi tiết.

Chức năng chính:
• Lấy danh sách phiên sạc từ backend
• Hiển thị thông tin: ID phiên, User ID, Station ID, thời gian, năng lượng tiêu thụ
• Loading state khi đang tải dữ liệu
• Error handling khi API thất bại

Cấu trúc dữ liệu:
- ChargingSession: Interface định nghĩa cấu trúc 1 phiên sạc
  + id: Mã phiên sạc
  + userId: ID người dùng đang sạc
  + stationId: ID trạm sạc
  + startTime: Thời gian bắt đầu sạc (ISO string)
  + endTime: Thời gian kết thúc sạc (ISO string)
  + energyUsed: Năng lượng tiêu thụ (kWh)

Flow hoạt động:
1. Component mount → Gọi API /api/charging-sessions
2. Loading state = true
3. Nhận response → Parse JSON → setData()
4. Loading state = false
5. Render table với data hoặc error message

Dependencies:
- React hooks: useState, useEffect
*/

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
