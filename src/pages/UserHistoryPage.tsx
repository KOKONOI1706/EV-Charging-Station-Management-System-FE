/**
 * ===============================================================
 * USER HISTORY PAGE (TRANG LỊCH SỬ NGƯỜI DÙNG)
 * ===============================================================
 * Page hiển thị lịch sử hoạt động của user
 * 
 * Chức năng:
 * - 📜 Hiển thị danh sách actions của user
 * - 🕐 Timestamp cho mỗi action
 * - 📊 Table view với ID, User ID, Action, Timestamp
 * 
 * Data structure:
 * ```typescript
 * interface UserHistory {
 *   id: number;
 *   userId: number;
 *   action: string;  // "Login", "Logout", "Book station", etc.
 *   timestamp: string;  // ISO date string
 * }
 * ```
 * 
 * API:
 * - GET /api/user-history
 * - Return: UserHistory[]
 * 
 * States:
 * - data: UserHistory[] - Dữ liệu lịch sử
 * - loading: Boolean - Đang load
 * - error: String | null - Error message
 * 
 * UI:
 * - Table với 4 columns:
 *   * ID
 *   * User ID
 *   * Action
 *   * Timestamp
 * - Loading state: "Loading data..."
 * - Error state: "Error: {message}"
 * 
 * Protected route:
 * - Allowed roles: customer, staff, admin
 * 
 * URL: /user-history
 * 
 * Dependencies:
 * - Backend API: /api/user-history
 */

import React, { useEffect, useState } from 'react';

interface UserHistory {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
}

const UserHistoryPage: React.FC = () => {
  const [data, setData] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user-history')
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
      <h2>User History</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.userId}</td>
              <td>{item.action}</td>
              <td>{item.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserHistoryPage;
