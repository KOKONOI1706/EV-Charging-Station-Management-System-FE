
/*
========================================
VITE CONFIG - Cấu hình Vite Build Tool
========================================

Mô tả:
File config cho Vite (build tool thay thế Create React App).
Cấu hình plugins, path aliases, build settings, dev server.

Chức năng chính:
• Plugin: React với SWC (fast refresh, JSX transform)
• Path aliases: Resolve dependency version conflicts
• Build settings: Target ESNext, output to 'build/'
• Dev server: Port 3000, auto-open browser

Plugins:
- @vitejs/plugin-react-swc: Fast Refresh + SWC compiler (nhanh hơn Babel)

Path Aliases:
Resolve conflicts giữa các version của dependencies.
Ví dụ: 'vaul@1.1.2' → 'vaul' (dùng version latest)

Alias categories:
1. UI Libraries:
   - vaul, sonner, recharts: UI components
   - react-resizable-panels, react-hook-form, react-day-picker
   
2. Radix UI Components (shadcn/ui base):
   - @radix-ui/react-*: Tooltip, Toggle, Tabs, Switch, Slider...
   - 30+ components từ Radix UI primitives
   
3. Styling & Utilities:
   - next-themes: Dark mode support
   - lucide-react: Icon library
   - class-variance-authority: CSS variants
   - cmdk: Command menu
   
4. Other:
   - input-otp: OTP input component
   - embla-carousel-react: Carousel
   - @jsr/supabase__supabase-js: Supabase client
   
5. '@' alias: Shortcut to './src' directory
   - Import example: import { Button } from '@/components/ui/button'

Build Settings:
- target: 'esnext' → Sử dụng modern JavaScript features
- outDir: 'build' → Output folder (thay vì 'dist')

Dev Server:
- port: 3000 → http://localhost:3000
- open: true → Tự động mở browser khi start

Extensions:
- resolve.extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
- Auto-resolve imports không cần viết extension

Dependencies:
- vite: Build tool & dev server
- @vitejs/plugin-react-swc: React plugin với SWC
*/

  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });