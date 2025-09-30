# EV Charging Station - Frontend

React + TypeScript + Vite frontend application for the EV Charging Station System.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Lucide React** - Icons
- **React Router** - Navigation
- **Sonner** - Toast notifications

## Features

- 🔐 Role-based authentication (Customer, Staff, Admin)
- 🗺️ Interactive station finder
- 📱 Responsive design
- 🌐 Multi-language support
- 📊 Analytics dashboards
- ⚡ Real-time booking management

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Setup

The frontend expects the backend API to be running on `http://localhost:5000`.

To change this, update the API base URL in your environment configuration.

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── ui/          # Base UI components
│   └── ...
├── data/            # Mock data and services
├── hooks/           # Custom React hooks
├── contexts/        # React contexts
├── styles/          # Global styles
└── utils/           # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build