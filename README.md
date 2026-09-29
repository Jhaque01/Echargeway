# eChargeWay

eChargeWay (formerly PowerLoop) is a modern web application designed for Electric Vehicle (EV) charging. The platform provides an intuitive interface for EV drivers to locate charging stations, view live charging statuses, and handle payments.

## Features

- **Interactive Maps**: Locate nearby EV charging stations using real-time interactive maps powered by Leaflet.
- **Live Status Updates**: View real-time availability and charging status of stations.
- **Payment Integration**: Seamlessly handle payments for charging sessions.
- **Modern UI**: A responsive and accessible user interface built with Shadcn UI and Tailwind CSS.

## Tech Stack

- **Frontend Framework**: React, Vite, TypeScript
- **Styling & UI Components**: Tailwind CSS, Shadcn UI
- **Maps**: Leaflet
- **Backend & Database**: Supabase, Drizzle ORM
- **Testing**: Vitest (with jsdom)

## Getting Started

### Prerequisites

- Node.js (recommended version 18+)
- npm (or another package manager)

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the project dependencies:
   ```bash
   npm install
   ```

### Scripts

- `npm run dev`: Start the local development server.
- `npm run build`: Build the application for production.
- `npm run preview`: Locally preview the production build.
- `npm run test`: Execute the test suite using Vitest.
- `npm run lint`: Run ESLint to verify code quality.

## Contributing

Ensure that you follow the established coding standards and write tests for new features. We use Vitest with a `jsdom` environment for testing.

When adding new dynamic styles in React components, avoid using `dangerouslySetInnerHTML`. Instead, use standard children interpolation (`<style>{content}</style>`) to prevent XSS vulnerabilities. Additionally, prefer `sessionStorage` or secure alternatives over `localStorage` for sensitive data.

## License

This project is proprietary and confidential.
