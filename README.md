# YouGnosis

YouGnosis is my very first big, completely solo project. This platform is designed to assist content creators in analyzing their channel performance.
I know there are relatively similar tools out there, but I build this to grow my own skills.

As is on 02.12.2025, YouGnosis is in active development, and new features are being added. Right now it can only retrieve and store analytics data from YouTube API.

You can use YouGnosis for free for **non-commercial purposes**. If you wish to use it commercially, you must obtain explicit permission from the copyright holder.

---

## Features

- **Analytics Dashboard**: Gain insights into views, watch time, retention rates, and more.
- **Competitor Comparison**: Compare your channel's performance with competitors.
- **SEO Recommendations**: Optimize your video metadata for better discoverability.
- **Authentication**: Secure login with Google OAuth2.
- **Responsive Design**: Works seamlessly on both desktop and mobile devices.

---

## Tech Stack

### Frontend

- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Backend

- **Framework**: Nest.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth2
- **Environment Configuration**: `@nestjs/config` with Joi validation

### APIs

- **YouTube Data API v3**
- **YouTube Analytics API**

---

## Project Structure

```bash
/YouGnosis
  /frontend          # React + Vite frontend
  /backend           # Nest.js backend
  /common            # Shared TypeScript types (supabase.types.ts)
  .github            # GitHub configuration
  .env.development   # Root-level environment variables
```

---

## Getting Started

### Prerequisites

- **Node.js** (v16+)
- **npm** or **yarn**
- **Supabase Account**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ermegilius/YouGnosis.git
   cd YouGnosis
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.development` and fill in the required values.

4. Start the development servers:

   ```bash
   npm run dev
   ```

   This will start both the backend and frontend servers in development mode concurrently.

---

## Scripts

### Root-Level Scripts

- **Start Development**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Clean**: `npm run clean:all`

### Frontend Scripts

- **Start Frontend**: `npm run start:frontend`
- **Build Frontend**: `npm run build:frontend`
- **Lint Frontend**: `npm run lint:frontend`

### Backend Scripts

- **Start Backend**: `npm run start:backend:dev`
- **Build Backend**: `npm run build:backend`
- **Lint Backend**: `npm run lint:backend`

---

## Environment Variables

### Required Variables

| Variable                      | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| NODE_ENV                      | Environment mode (`development`, `production`, etc.) |
| PORT                          | Backend server port                                  |
| SUPABASE_PROJECT_ID           | Supabase project ID                                  |
| SUPABASE_DB_PASSWORD          | Supabase database password                           |
| SUPABASE_URL                  | Supabase project URL                                 |
| SUPABASE_STORAGE_URL          | Supabase storage URL                                 |
| SUPABASE_PUBLISHABLE_KEY      | Supabase public API key                              |
| SUPABASE_SECRET_KEY_DEFAULT   | Supabase secret API key (backend only)               |
| VITE_NODE_ENV                 | Frontend environment mode                            |
| VITE_PORT                     | Frontend dev server port                             |
| VITE_SUPABASE_URL             | Supabase URL for frontend                            |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase public API key for frontend                 |
| VITE_API_URL                  | Backend API URL for frontend proxy                   |
| VITE_FRONTEND_URL             | Public frontend URL                                  |
| GOOGLE_OAUTH_CLIENT_ID        | Google OAuth2 client ID                              |
| GOOGLE_OAUTH_CLIENT_SECRET    | Google OAuth2 client secret                          |
| ALLOWED_ORIGINS               | Comma-separated list of allowed CORS origins         |

Refer to `.env.example` for a complete list of environment variables.

---

## Folder Structure

### Frontend

- **`src/components`**: Reusable UI components (e.g., `Auth`, `Navigation`, `Footer`)
- **`src/context`**: React Context providers (e.g., `AuthContext`, `ThemeContext`)
- **`src/hooks`**: Custom React hooks (e.g., `useAuth`, `useTheme`)
- **`src/pages`**: Page components (e.g., `LoginPage`, `LandingPage`)
- **`src/router`**: Route configuration
- **`src/api`**: API services and Axios configuration
- **`src/supabase`**: Supabase client setup

### Backend

- **`src/modules`**: Nest.js modules (e.g., `app`, `supabase`, `test-data`)
- **`src/common`**: Shared utilities and types
- **`src/main.ts`**: Application bootstrap file

### Common

- **`common/supabase.types.ts`**: Shared Supabase types for frontend and backend.

---

## License

This project is licensed under the **Creative Commons BY-NC-SA 4.0** license. See the `LICENSE.md` file for details.

---

## Contributing

Contributions are welcome! Please follow the coding guidelines outlined in the GitHub Copilot Instructions.

---

## Contact

For inquiries, please contact the author at <yougnosis@gmail.com>.

---

**Happy analyzing!**
