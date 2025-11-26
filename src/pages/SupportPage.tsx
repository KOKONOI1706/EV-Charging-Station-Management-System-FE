/**
 * ===============================================================
 * SUPPORT PAGE ROUTE (TRANG HỖ TRỢ)
 * ===============================================================
 * Route wrapper cho SupportPage component
 * 
 * Chức năng:
 * - 📞 Hiển thị trang hỗ trợ khách hàng
 * - ❓ FAQ (Frequently Asked Questions)
 * - 📧 Contact form
 * - 💬 Live chat (nếu có)
 * 
 * URL: /support
 * 
 * Component:
 * - SupportPage (S): Component chính
 * 
 * Access: Public (không cần login)
 * 
 * Dependencies:
 * - SupportPage component
 */

import { SupportPage as S } from "../components/SupportPage";

export default function SupportRoute() {
  return <S />;
}
