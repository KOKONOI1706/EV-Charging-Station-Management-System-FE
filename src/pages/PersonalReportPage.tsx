/*
========================================
PERSONAL REPORT PAGE - Trang Báo Cáo Cá Nhân
========================================

Mô tả:
Trang hiển thị danh sách báo cáo cá nhân của user dưới dạng bảng.
Fetch data từ API /api/personal-reports và render ra table.

Chức năng chính:
• Lấy danh sách báo cáo từ backend
• Hiển thị thông tin: ID, User ID, loại báo cáo, thời gian tạo, chi tiết
• Loading state khi đang tải dữ liệu
• Error handling khi API thất bại

Cấu trúc dữ liệu:
- PersonalReport: Interface định nghĩa cấu trúc 1 báo cáo
  + id: Mã báo cáo
  + userId: ID người dùng
  + reportType: Loại báo cáo (charging, booking, payment...)
  + createdAt: Thời gian tạo báo cáo
  + details: Chi tiết báo cáo (JSON string hoặc text)

Flow hoạt động:
1. Component mount → Gọi API /api/personal-reports
2. Loading state = true
3. Nhận response → Parse JSON → setData()
4. Loading state = false
5. Render table với data hoặc error message

Dependencies:
- React hooks: useState, useEffect
*/

import React, { useEffect, useState } from 'react';

interface PersonalReport {
  id: number;
  userId: number;
  reportType: string;
  createdAt: string;
  details: string;
}

const PersonalReportPage: React.FC = () => {
  const [data, setData] = useState<PersonalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/personal-reports')
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
      <h2>Personal Reports</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Report Type</th>
            <th>Created At</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.userId}</td>
              <td>{item.reportType}</td>
              <td>{item.createdAt}</td>
              <td>{item.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonalReportPage;
