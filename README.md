# EV Charging Station Management System — Frontend

Frontend application for an EV charging station management platform. The application provides customer-facing station discovery and booking flows together with role-based management and analytics interfaces.

## Role in the Project

I contributed across the project as a team leader and full-stack developer, including system design, business rules, backend, database, and frontend implementation.

## Key Features

- **Role-based access** — Customer, Staff, and Admin experiences.
- **Station Finder** — Browse and search charging stations.
- **Booking Management** — User-facing reservation workflows and management interfaces.
- **Analytics Dashboards** — Operational and business data visualization.
- **Responsive UI** — Designed for different screen sizes.
- **Multi-language Support** — Localized application interface.

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Radix UI**
- **React Router**
- **Lucide React**
- **Sonner**

## Project Structure

```text
src/
├── components/       # Reusable UI components
│   ├── ui/           # Base UI components
│   └── ...
├── data/             # Data and service definitions
├── hooks/            # Custom React hooks
├── contexts/         # Shared application contexts
├── styles/           # Global styles
└── utils/            # Utility functions
```

## Getting Started

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Backend Integration

The frontend consumes the project's backend REST API. Configure the API base URL in the local environment configuration before running the application.

## Project Focus

The main focus was translating EV charging business workflows into a usable web application while keeping the frontend aligned with authentication, station, reservation, payment, and management flows implemented across the system.
