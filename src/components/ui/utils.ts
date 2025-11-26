/**
 * UTILITY FUNCTIONS (TIẾNG VIỆT)
 * 
 * File chứa các utility functions dùng chung cho UI components.
 * 
 * FUNCTION: cn()
 * - Mục đích: Merge TailwindCSS class names một cách thông minh
 * - Giải quyết vấn đề: Conflict giữa các Tailwind classes (vd: "p-4 p-2" → "p-2")
 * - Kết hợp: clsx (conditional classes) + twMerge (merge Tailwind conflicts)
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. clsx: Xử lý conditional classes, loại bỏ falsy values
 *    - clsx('foo', true && 'bar', 'baz') → 'foo bar baz'
 *    - clsx({ foo: true, bar: false }) → 'foo'
 * 2. twMerge: Merge Tailwind classes, giữ class cuối cùng khi conflict
 *    - twMerge('p-4 p-2') → 'p-2'
 *    - twMerge('text-red-500 text-blue-500') → 'text-blue-500'
 * 
 * SỬ DỤNG:
 * ```tsx
 * // Basic merge
 * cn('px-2 py-1', 'px-3') // → 'py-1 px-3'
 * 
 * // Conditional classes
 * cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class')
 * 
 * // Merge với className prop
 * function Button({ className, ...props }) {
 *   return (
 *     <button
 *       className={cn('px-4 py-2 rounded', className)}
 *       {...props}
 *     />
 *   )
 * }
 * 
 * // Usage: <Button className="px-6" /> → 'py-2 rounded px-6' (px-6 override px-4)
 * 
 * // Array of classes
 * cn(['base', 'class'], 'another')
 * 
 * // Objects
 * cn('base', { active: isActive, disabled: isDisabled })
 * 
 * // Mix all
 * cn(
 *   'base-class',
 *   condition && 'conditional-class',
 *   { active: isActive },
 *   className
 * )
 * ```
 * 
 * VÍ DỤ THỰC TẾ:
 * ```tsx
 * // Component với default styles có thể override
 * function Alert({ variant = 'default', className, children }) {
 *   return (
 *     <div className={cn(
 *       'rounded-lg border p-4', // Base styles
 *       variant === 'destructive' && 'border-red-500 text-red-900', // Variant styles
 *       variant === 'success' && 'border-green-500 text-green-900',
 *       className // User custom styles (có thể override)
 *     )}>
 *       {children}
 *     </div>
 *   )
 * }
 * 
 * // Usage
 * <Alert className="p-6 border-blue-500"> // p-6 overrides p-4, border-blue-500 overrides border-red/green
 *   Message
 * </Alert>
 * ```
 * 
 * LỢI ÍCH:
 * - Tránh duplicate Tailwind classes
 * - Giải quyết conflicts thông minh (giữ class cuối)
 * - Support conditional classes dễ dàng
 * - Type-safe với TypeScript
 * - Performance tốt (cached)
 * 
 * DEPENDENCIES:
 * - clsx: Conditional classnames utility
 * - tailwind-merge: Merge conflicting Tailwind classes
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
