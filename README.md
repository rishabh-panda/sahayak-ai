# Sahayak-AI — Health Companion for Indian Senior Citizens

> An AI-powered full-stack health companion web app designed specifically for Indian senior citizens (age 50+). Built with React, Express 5, PostgreSQL, and Drizzle ORM — featuring multilingual wellness tips, medication reminders, daily check-ins, health tracking, an AI assistant, and emergency contacts.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Design System](#design-system)
- [Accessibility](#accessibility)
- [Deployment](#deployment)

---

## Overview

Sahayak-AI ("Sahayak" means "helper" in Hindi) is a purpose-built health companion designed around the specific needs of Indian senior citizens:

- **Large, readable UI** with Inter font and WCAG AA-compliant contrast ratios
- **Multilingual daily tips** in 13 Indian languages + English (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more)
- **AI assistant** powered by OpenAI GPT-4o with a senior-friendly system prompt focused on health guidance
- **Medication management** with dosage tracking, frequency, and prescribing doctor details
- **Daily check-in** with mood and energy tracking using IST timezone-aware date detection
- **Health vitals tracker** for blood pressure, blood sugar, weight, heart rate, and temperature
- **Emergency contacts** with one-tap calling including automatic +91 country code
- **12-hour AM/PM time format** throughout, as preferred by Indian users
- **Delete confirmations** on all destructive actions

---

## Key Features

### AI Assistant
- Conversational health guidance in plain, easy language
- System prompt tuned for Indian senior citizens — mentions common Indian foods, cultural practices, and Ayurvedic awareness
- Suggested prompts to help users get started ("How do I take my medicines safely?")
- Persistent chat history per session

### Medication Reminders
- Create reminders for medicine, doctor visits, exercise, meals, or any custom event
- Repeat schedule by day of week (Mon–Sun)
- Mark complete with one tap; visual strikethrough on completion
- Delete confirmation dialog to prevent accidental loss

### Medicine Tracker
- Full medication records: name, dosage, frequency, times, instructions, prescribed by
- Active medicine count with safety advisory
- AM/PM formatted time badges

### Daily Check-In
- Five mood levels (Great → Very Low) with distinct colors and icons
- Three energy levels (High Energy, Moderate, Fatigued)
- Optional free-text notes
- IST-aware "today" detection (UTC+5:30)
- Check-in streak tracking on dashboard

### Health Vitals
- Supports: Blood Pressure (mmHg), Blood Sugar (mg/dL), Weight (kg), Heart Rate (bpm), Temperature (°F)
- Latest reading summary cards on the tracker page
- Recent readings history list
- Weekly reading count celebration card

### Daily Tips
- 13 Indian languages + English
- Tips initialize from user's profile language preference automatically
- Categories: Health, Wellness, Social, Spiritual, Nutrition, Technology
- Color-coded category badges

### Emergency Contacts
- Mark contacts as Emergency (shown pinned at top)
- One-tap calling via `tel:` links with automatic `+91` prefix for Indian numbers
- Relationships: Son, Daughter, Spouse, Sibling, Friend, Doctor, Caregiver, Other
- Delete confirmation dialog

### Profile
- Name, age, city, emergency phone
- Language preference (synced to tips page)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool and dev server |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling and design tokens |
| Wouter | Client-side routing |
| TanStack Query v5 | Data fetching, caching, invalidation |
| Radix UI | Accessible headless components (Dialog, AlertDialog, Select, Switch, Tooltip) |
| Lucide React | Icon library (no emojis) |
| Orval | OpenAPI → React Query hook code generation |

### Backend
| Technology | Purpose |
|---|---|
| Express 5 | HTTP server framework |
| TypeScript + ESBuild | Type-safe server with fast builds |
| Zod | Input/output validation via generated schemas |
| Drizzle ORM | Type-safe PostgreSQL ORM |
| PostgreSQL | Primary relational database |
| Pino | Structured JSON logging |
| OpenAI SDK | GPT-4o integration for AI assistant |

### Monorepo
| Package | Purpose |
|---|---|
| `@workspace/api-spec` | OpenAPI 3.0 schema (single source of truth) |
| `@workspace/api-client-react` | Generated React Query hooks (from Orval) |
| `@workspace/api-zod` | Generated Zod validation schemas (from Orval) |
| `@workspace/db` | Drizzle schema, migrations, and DB connection |
| `@workspace/saathi-care` | React + Vite frontend |
| `@workspace/api-server` | Express 5 backend API |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (User)                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Replit Reverse Proxy                          │
│     Path-based routing: / → frontend, /api → backend            │
└───────────────┬───────────────────────────────┬──────────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────┐         ┌───────────────────────────────┐
│  React + Vite SPA    │         │  Express 5 API Server          │
│  @workspace/         │         │  @workspace/api-server         │
│  saathi-care         │ ───────▶│  Port: 8080                   │
│  Port: dynamic       │  fetch  │  Base path: /api              │
└──────────────────────┘         └──────────────┬────────────────┘
                                                │
                                 ┌──────────────▼────────────────┐
                                 │   PostgreSQL Database          │
                                 │   (Replit managed)             │
                                 └───────────────────────────────┘
                                                │
                                 ┌──────────────▼────────────────┐
                                 │   OpenAI API (GPT-4o)         │
                                 │   AI chat route: POST /api/ai  │
                                 └───────────────────────────────┘
```

### Request Flow

1. User loads the SPA at `/`
2. Vite serves the React app; Wouter handles client-side routing
3. TanStack Query calls generated hooks (e.g. `useGetDashboardSummary()`)
4. Hooks call the Express API at `/api/*`
5. Express validates inputs with Zod, queries PostgreSQL via Drizzle
6. For AI chat: Express forwards to OpenAI with a senior-citizen-tuned system prompt
7. Data returned to React, cached by TanStack Query, rendered in UI

### Contract-First API Design

The API shape is defined once in `lib/api-spec/openapi.yaml`. Running `pnpm --filter @workspace/api-spec run codegen` regenerates:
- `lib/api-client-react/src/generated/` — React Query hooks for every endpoint
- `lib/api-zod/src/generated/` — Zod schemas for validation on both client and server

---

## Project Structure

```
workspace/
├── artifacts/
│   ├── api-server/              # Express 5 backend
│   │   └── src/
│   │       ├── routes/          # Express route handlers
│   │       │   ├── ai.ts        # OpenAI GPT-4o chat
│   │       │   ├── reminders.ts
│   │       │   ├── medications.ts
│   │       │   ├── health.ts
│   │       │   ├── checkin.ts
│   │       │   ├── contacts.ts
│   │       │   ├── tips.ts
│   │       │   ├── profile.ts
│   │       │   ├── dashboard.ts
│   │       │   └── seed.ts      # Initial data seeding
│   │       └── index.ts         # Server entry point
│   └── saathi-care/             # React + Vite frontend
│       ├── public/
│       │   └── favicon.svg      # Branded indigo brain-circuit icon
│       └── src/
│           ├── components/
│           │   ├── layout/
│           │   │   └── app-layout.tsx   # Header + bottom nav
│           │   └── ui/                  # Radix UI + shadcn components
│           ├── pages/
│           │   ├── dashboard.tsx        # Home / summary
│           │   ├── assistant.tsx        # AI chat
│           │   ├── reminders.tsx        # Reminders CRUD
│           │   ├── medications.tsx      # Medications CRUD
│           │   ├── health.tsx           # Vitals tracker
│           │   ├── checkin.tsx          # Daily wellbeing check-in
│           │   ├── contacts.tsx         # Emergency contacts
│           │   ├── tips.tsx             # Multilingual wellness tips
│           │   ├── profile.tsx          # User profile settings
│           │   └── not-found.tsx        # 404 page
│           ├── hooks/                   # Custom React hooks
│           ├── App.tsx                  # Router setup
│           └── index.css                # Design system (Tailwind v4)
├── lib/
│   ├── api-spec/                # OpenAPI 3.0 schema (source of truth)
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Drizzle ORM schema + migrations
├── scripts/                     # Utility scripts
├── pnpm-workspace.yaml          # Workspace config + catalog
└── package.json                 # Root tooling
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (or use the Replit built-in)

### Installation

```bash
# Install all workspace dependencies
pnpm install

# Run database migrations
pnpm --filter @workspace/db run migrate

# (Optional) Regenerate API client from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

### Running in Development

The project uses Replit Workflows to start each service. Equivalent shell commands:

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend dev server
pnpm --filter @workspace/saathi-care run dev
```

The frontend is served at `http://localhost:<PORT>/` and the API at `http://localhost:8080/api`.

> **Note:** On first startup, the API server seeds initial data (sample reminders, medications, tips in multiple languages, a sample profile, and emergency contacts) if the database is empty.

### Type Checking

```bash
# Full type check (libs + all artifacts)
pnpm run typecheck
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgres://user:pass@host:5432/db`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for the AI assistant (GPT-4o) |
| `SESSION_SECRET` | Yes | Random secret for session signing |
| `PORT` | Auto | Port for each service (set by Replit workflow config) |
| `NODE_ENV` | Auto | `development` or `production` |

---

## API Reference

All endpoints are prefixed with `/api`.

### Dashboard

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Returns user name, streak, today's reminder progress, weekly vitals count, motivational message, upcoming reminders |

### Profile

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/profile` | Get user profile |
| `PUT` | `/api/profile` | Update name, age, city, phone, language preference |

### Reminders

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reminders` | List all reminders |
| `POST` | `/api/reminders` | Create a reminder |
| `PATCH` | `/api/reminders/:id` | Update (mark complete, etc.) |
| `DELETE` | `/api/reminders/:id` | Delete a reminder |
| `GET` | `/api/reminders/today` | Today's reminders with completion status |

### Medications

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/medications` | List all medications |
| `POST` | `/api/medications` | Add a medication |
| `DELETE` | `/api/medications/:id` | Remove a medication |

### Health Records

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health-records` | List records (supports `?limit=`) |
| `POST` | `/api/health-records` | Log a new reading |
| `GET` | `/api/health-records/summary` | Latest reading per vital type + weekly count |

### Check-In

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/checkin/history` | Full check-in history |
| `POST` | `/api/checkin` | Submit today's check-in (mood + energy + optional notes) |

### Contacts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/contacts` | List all contacts |
| `POST` | `/api/contacts` | Add a contact |
| `DELETE` | `/api/contacts/:id` | Remove a contact |

### Tips

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tips?language=en` | Fetch tips for a given language code |

### AI Assistant

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send a message; returns AI response. Body: `{ messages: [{role, content}] }` |

---

## Database Schema

Managed with Drizzle ORM. Tables live in `lib/db/src/schema.ts`.

### `profile`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `name` | text | User's full name |
| `age` | integer | Age in years |
| `city` | text | City of residence |
| `emergencyPhone` | text | Emergency contact number |
| `language` | text | Preferred language code (`en`, `hi`, etc.) |
| `createdAt` | timestamp | Record creation time |
| `updatedAt` | timestamp | Last update time |

### `reminders`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `title` | text | Reminder name |
| `type` | text | `medication`, `appointment`, `exercise`, `meal`, `other` |
| `time` | text | 24h time string (`HH:MM`) |
| `daysOfWeek` | text[] | Array of day abbreviations |
| `completedToday` | boolean | Resets each day |
| `isActive` | boolean | Soft disable flag |

### `medications`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `name` | text | Medicine name |
| `dosage` | text | Dosage amount (e.g. "500mg") |
| `frequency` | text | Free text (e.g. "Twice daily") |
| `times` | text[] | List of `HH:MM` time strings |
| `instructions` | text | Optional instructions |
| `prescribedBy` | text | Doctor name |
| `isActive` | boolean | Active flag |

### `health_records`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `type` | text | `blood_pressure`, `blood_sugar`, `weight`, `heart_rate`, `temperature` |
| `value` | text | Reading value as string |
| `unit` | text | Unit string (`mmHg`, `mg/dL`, etc.) |
| `notes` | text | Optional notes |
| `recordedAt` | timestamp | When the reading was taken |

### `checkins`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `date` | text | IST date string `YYYY-MM-DD` |
| `mood` | text | `very_happy`, `happy`, `okay`, `sad`, `very_sad` |
| `energy` | text | `high`, `medium`, `low` |
| `notes` | text | Optional notes |
| `createdAt` | timestamp | Record creation time |

### `contacts`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `name` | text | Contact name |
| `relationship` | text | `son`, `daughter`, `spouse`, `sibling`, `friend`, `doctor`, `caregiver`, `other` |
| `phone` | text | Phone number (stored as-is; `+91` prefix added at dial-time) |
| `isEmergency` | boolean | Pin to top of contacts list |

### `tips`
| Column | Type | Description |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `title` | text | Tip headline |
| `content` | text | Full tip body |
| `category` | text | `health`, `wellness`, `social`, `spiritual`, `nutrition`, `technology` |
| `language` | text | BCP-47 language code |

---

## Design System

Defined in `artifacts/saathi-care/src/index.css` using Tailwind CSS v4 CSS variables.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--primary` | `234 86% 59%` (indigo) | Primary actions, active nav, CTAs |
| `--secondary` | `172 66% 42%` (teal) | Success states, check-in, health |
| `--background` | `220 14% 97%` | Page background |
| `--foreground` | `224 71% 10%` | Primary text |
| `--muted-foreground` | `220 9% 46%` | Placeholder/secondary text |
| `--border` | `220 13% 91%` | Card borders |
| `--destructive` | `0 84% 60%` | Delete/danger actions |

### Typography

- **Font**: Inter (loaded via Google Fonts)
- **Base size**: 15–16px body, 17px forms, 22–24px headings
- **Senior-friendly**: Minimum 13px for secondary text; no text below 11px for labels

### Component Conventions

- All cards use `rounded-2xl` with `border-border/60`
- All interactive buttons have a minimum 44×44px touch target
- Icon-only buttons use `data-icon-only` attribute to bypass the global `min-height: 48px` rule
- All icon-only buttons carry `aria-label` for screen reader accessibility
- Delete actions always show an `AlertDialog` confirmation before executing
- Form validation shows inline red error messages (not toast-only)
- Glassmorphism header: `backdrop-filter: blur(16px)` with `bg-background/80`

---

## Accessibility

Sahayak-AI targets WCAG 2.1 Level AA compliance, with additional considerations for elderly users:

| Feature | Implementation |
|---|---|
| Color contrast | All text meets 4.5:1 minimum ratio |
| Keyboard navigation | All interactive elements are focusable; forms submit on Enter |
| Screen reader support | `aria-label` on all icon-only buttons; `aria-current="page"` on active nav |
| `aria-pressed` | Mood/energy selectors announce selected state |
| `aria-invalid` | Form fields announce validation errors |
| `role` attributes | Navigation, radiogroup, banner landmark roles applied |
| Focus management | Dialog focus trapping via Radix UI |
| Touch targets | Minimum 44×44px for all tappable elements |
| Motion | Page transitions use `animate-in` with short 300–400ms durations |

---

## Deployment

The project is deployed on Replit using its native publish infrastructure.

### Production Checklist

- [ ] `DATABASE_URL` set to production PostgreSQL
- [ ] `OPENAI_API_KEY` set in Replit Secrets
- [ ] `SESSION_SECRET` set to a long random string
- [ ] Run `pnpm --filter @workspace/db run migrate` against production DB before first deploy
- [ ] Review seed data — seeding only runs once on a fresh database

### Build Commands

```bash
# Build the API server
pnpm --filter @workspace/api-server run build

# Build the frontend
pnpm --filter @workspace/saathi-care run build
```

The Replit reverse proxy routes:
- `/` → Frontend SPA (served by Vite in dev, static files in production)
- `/api` → Express API server on port 8080

---

## Language Support

| Code | Language |
|---|---|
| `en` | English |
| `hi` | Hindi (हिन्दी) |
| `ta` | Tamil (தமிழ்) |
| `te` | Telugu (తెలుగు) |
| `bn` | Bengali (বাংলা) |
| `mr` | Marathi (मराठी) |
| `gu` | Gujarati (ગુજરાતી) |
| `kn` | Kannada (ಕನ್ನಡ) |
| `ml` | Malayalam (മലയാളം) |
| `pa` | Punjabi (ਪੰਜਾਬੀ) |

Tips for additional languages can be seeded in the `tips` table using the same schema.

---

## License

This project is proprietary software. All rights reserved.
