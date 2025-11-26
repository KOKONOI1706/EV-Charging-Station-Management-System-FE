/**
 * USE MOBILE HOOK (TIẾNG VIỆT)
 * 
 * Custom React Hook để detect thiết bị mobile dựa trên window width.
 * 
 * BREAKPOINT:
 * - MOBILE_BREAKPOINT: 768px
 * - Mobile: width < 768px
 * - Desktop: width >= 768px
 * 
 * CÁC HOẠT ĐỘNG:
 * 1. Khởi tạo state isMobile = undefined (SSR safe)
 * 2. useEffect mount:
 *    - Tạo MediaQueryList với query: "(max-width: 767px)"
 *    - Set initial value: window.innerWidth < 768
 *    - Add event listener "change" để detect resize
 *    - Cleanup: Remove event listener khi unmount
 * 3. Return !!isMobile (convert undefined|boolean → boolean)
 * 
 * MEDIA QUERY:
 * - window.matchMedia(): Native browser API
 * - Efficient hơn window resize event
 * - Chỉ fire khi cross breakpoint (không fire mỗi lần resize)
 * - Support bởi tất cả browsers hiện đại
 * 
 * SSR SAFE:
 * - Initial state: undefined (không crash khi render server-side)
 * - Set value trong useEffect (chỉ chạy client-side)
 * - Return !!isMobile để convert undefined → false (safe default)
 * 
 * TAILWIND BREAKPOINTS:
 * - sm: 640px
 * - md: 768px ⭐ (MOBILE_BREAKPOINT)
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 * 
 * SỬ DỤNG:
 * ```tsx
 * import { useIsMobile } from '@/components/ui/use-mobile'
 * 
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 * 
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileView />
 *       ) : (
 *         <DesktopView />
 *       )}
 *     </div>
 *   )
 * }
 * 
 * // Conditional rendering
 * const isMobile = useIsMobile()
 * if (isMobile) {
 *   return <Sheet>Mobile Drawer</Sheet>
 * }
 * return <Dialog>Desktop Modal</Dialog>
 * 
 * // Trong Sidebar component
 * const { isMobile } = useSidebar()
 * if (isMobile) {
 *   return <Sheet>Sidebar</Sheet> // Mobile: Sheet
 * }
 * return <aside>Sidebar</aside> // Desktop: Fixed sidebar
 * ```
 * 
 * USE CASES:
 * - Sidebar: Sheet (mobile) vs Fixed sidebar (desktop)
 * - Navigation: Drawer (mobile) vs Horizontal menu (desktop)
 * - Table: Card view (mobile) vs Table view (desktop)
 * - Tooltip: Hidden (mobile) vs Show (desktop)
 * - Dialog size: Fullscreen (mobile) vs Modal (desktop)
 * 
 * PERFORMANCE:
 * - MediaQueryList.addEventListener: Efficient, chỉ fire khi cần
 * - Không dùng window resize (fire liên tục, lag)
 * - Single event listener cho toàn app (nếu dùng chung hook)
 * 
 * ALTERNATIVE:
 * - CSS media queries: @media (max-width: 768px) { ... }
 * - Tailwind responsive: md:block hidden
 * - Hook này cho logic JavaScript, không thay CSS
 * 
 * DEPENDENCIES:
 * - React hooks (useState, useEffect)
 */
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
