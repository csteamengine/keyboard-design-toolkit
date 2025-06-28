# Keyboard Design Toolkit - Local Development Setup

The `keyboard-design-toolkit` is an open-source project aiming to combine and improve upon several tools in the custom keyboard design workflow. It draws inspiration from tools like [Keyboard Layout Editor](http://www.keyboard-layout-editor.com/), ai03's Plate Generator, Keebio's Plate Generator, and others. The goal is to provide a unified, modern, and more powerful experience for designing layouts, generating plates, and managing keyboard builds.

---

# # Local Development Setup Guide

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Docker](https://www.docker.com/get-started) (for running Supabase locally)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed globally

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/keyboard-design-toolkit.git
cd keyboard-design-toolkit
```

---

## 2. Start Supabase Locally

Start the Supabase local development environment using Docker:

```bash
supabase start --foreground
```

This will start Postgres, Auth, Realtime, and other Supabase services locally.

> **Note:** Using `--foreground` keeps logs in your terminal so you can see email confirmation and magic links.

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following content:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

- To find your `anon` key, check the output of `supabase status` or look inside `supabase/config.toml` under the `[auth]` section.
- Make sure the variables use the `VITE_` prefix so they are exposed in your React app.

---

## 4. Apply Database Migrations

Ensure your local database schema matches the latest migrations:

```bash
supabase db reset
```

> This command drops your local database and reapplies all migrations.

---

## 5. Install Dependencies

Install the project dependencies using Yarn:

```bash
yarn install
```

---

## 6. Run the Development Server

Start the Vite development server:

```bash
yarn dev
```

---

## 7. Using Auth Locally

- When you sign up or request magic links, check the terminal running `supabase start --foreground` for confirmation URLs.
  - Copy and paste those URLs into your browser to simulate email confirmation or login.
  - **Note: I didn't find this step necessary, local signups were automatically verifying my email.**
- **Note: 3rd Party OAuth (GitHub, Google) won't work locally.**
  - For that you'd need to set up a supabase Hobby account and configure OAuth providers in the Supabase dashboard.
  - Then You'd need to copy the production `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your `.env` file.

---

## 8. Tech Stack Highlights

- **React** with **TypeScript**
- **Redux** for state management
- **React Flow** for keyboard layout editing
- **Material UI** for UI components
- **Vite** as the build tool and dev server
- **Supabase** for backend services (Auth, Database, Realtime)
- **Vercel** for deployment--though that is not covered in this guide.

---

## 9. Useful Commands

| Command                 | Description                                  |
|-------------------------|----------------------------------------------|
| `supabase start`        | Start Supabase services locally (background)|
| `supabase start --foreground` | Start Supabase with logs in your terminal  |
| `supabase db reset`     | Reset local database and run all migrations  |
| `supabase db push`      | Apply new migrations incrementally            |
| `supabase stop`         | Stop local Supabase services                   |
| `yarn install`          | Install project dependencies                   |
| `yarn dev`              | Start the Vite development server              |

---

## 10. Additional Notes

- `.env.local` is ignored by Git to keep your keys secure.
- Use `.env.example` with placeholder values to help onboard contributors.
- For production, update environment variables to point to your hosted Supabase instance.

---

## Questions or Issues?

Feel free to open an issue or reach out!

---

Happy hacking! 🚀