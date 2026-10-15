# eChargeWay

**eChargeWay** is a smart EV charging web application designed to help users find and charge their electric vehicles in seconds.

## Features

- **Smart EV Charging**: Locate nearby EV charging stations instantly.
- **Live Charging Status**: Real-time tracking of charging session progress and history.
- **Nearest Station Routing**: Automatically calculates the closest available station with direct navigation links via Google Maps.
- **Interactive Map**: View a map of available chargers and check slot availability.
- **User Authentication**: Secure user authentication and profile management powered by Supabase.

## Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Framer Motion for smooth animations
- **UI Components**: Shadcn UI (Radix UI)
- **Map Integration**: Leaflet (`react-leaflet` / `leaflet`)
- **Backend & Database**: Supabase (PostgreSQL, Auth)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables for Supabase in a `.env` file (refer to `.env.example` if available).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Scripts

- `npm run dev`: Starts the local development server using Vite.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run test`: Executes the Vitest test suite.
