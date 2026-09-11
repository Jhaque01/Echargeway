# eChargeWay

eChargeWay (formerly PowerLoop) is a comprehensive web application for Electric Vehicle (EV) drivers to find charging stations, monitor live charging status, and manage payments.

## Features

- **Find Chargers**: Interactive map powered by Leaflet to locate nearby EV charging stations.
- **Live Charging Status**: Monitor real-time charging progress (percentage, kWh, and cost).
- **Authentication**: Secure user authentication and profile management powered by Supabase.
- **Payments Integration**: Seamless payment processing including UPI support.
- **Responsive Design**: Optimized for both mobile and desktop experiences.

## Technologies Used

- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Radix UI (shadcn/ui)
- **Map Integration**: Leaflet (`leaflet` and `react-leaflet`)
- **Backend & Auth**: Supabase
- **State Management**: React Query (`@tanstack/react-query`)
- **Routing**: React Router (`react-router-dom`)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine. The project uses `bun` or `npm` for package management.

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the root directory and configure your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080` (or another port provided by Vite).

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Linting and Testing

- **Linting**: Run ESLint to check for code quality:
  ```bash
  npm run lint
  ```
- **Testing**: Run Vitest to execute tests:
  ```bash
  npm run test
  ```

## License

This project is licensed under the MIT License.
