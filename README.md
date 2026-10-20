<div align="center">

# SponsCRM

### From first contact to confirmed sponsorship.

A shared workspace for sponsorship outreach, company ownership, deal pipelines, and timely follow-ups.

[![Live app](https://img.shields.io/badge/Live_App-sponscrm.tech-4f46e5?style=for-the-badge)](https://www.sponscrm.tech)
[![Backend checks](https://github.com/itzzfalcon52/sponsCRM/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/itzzfalcon52/sponsCRM/actions/workflows/backend-ci.yml)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-111827?style=flat-square&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs&logoColor=white)

**[Live app](https://www.sponscrm.tech)** · **[Screenshots](#screenshots)** · **[Features](#features)** · **[Architecture](#architecture)** · **[Quick start](#quick-start)** · **[API reference](#api-reference)** · **[Deployment](#deployment)**

</div>

---

## Overview

SponsCRM helps event teams, student organizations, and sponsorship committees keep their outreach organized. Instead of tracking company details, assignments, conversation notes, and next steps in separate places, the team works from one company record and a shared deal pipeline.

An administrator creates a workspace and invites the team. Members add prospects, record calls or meetings, and follow up on the companies they manage. Senior members and administrators can review the wider pipeline, distribute work, and monitor progress. Administrators can also sync company records to Google Sheets.

The application includes a React frontend, an Express API, and a PostgreSQL database managed through Prisma, organized as an npm workspace with Turborepo.

![SponsCRM administrator dashboard showing the sponsorship pipeline, revenue forecast, financial split, portfolio, and team workload](docs/screenshots/dashboard.png)

> Screenshots throughout this README show the current application with fictional demonstration data. Company names, people, invite codes, and financial figures are illustrative.

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [How the workflow fits together](#how-the-workflow-fits-together)
- [Roles and workspace access](#roles-and-workspace-access)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Google sign-in](#google-sign-in)
- [Google Sheets integration](#google-sheets-integration)
- [API reference](#api-reference)
- [Development and verification](#development-and-verification)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

| Area | What you can do |
| --- | --- |
| **Workspaces** | Create an organization, join using an invite code, and collaborate with a team. |
| **Company records** | Track the company, point of contact, email, phone, LinkedIn URL, domain, notes, deal value, and sponsorship type. |
| **Creator attribution** | See who originally added each company, separately from its current assignee. Filter by that creator across paginated results. |
| **Search and filters** | Combine company/contact search with status, domain, and “Added by” filters. |
| **Assignment** | Assign or unassign individual companies, or select several for a bulk assignment. |
| **Pipeline** | Organize prospects across seven stages. Drag cards on desktop or use the stage selector on small screens and touch devices. |
| **Activities** | Record calls, emails, and meetings with notes; inspect the company timeline and recent team activity. |
| **Follow-ups** | Set a next-contact date or use the activity-based default. Review overdue and due-today action items. |
| **Dashboards** | Review pipeline distribution, closed sponsorship values, weighted cash pipeline, portfolio previews, and team workload. |
| **Spreadsheet import** | Paste rows copied from Excel or another spreadsheet, preview them, select a domain, and import the batch. |
| **Duplicate detection** | Receive fuzzy name-match suggestions before adding a company; exact names are unique within an organization. |
| **Google Sheets** | An administrator can connect Google and manually sync company records into domain-specific spreadsheet tabs. |
| **Google sign-in** | Optional Google login and signup alongside email/password. Existing users link their account once with their CRM password and keep the same data. |
| **Team and account settings** | Manage member roles, workspace details, profile information, passwords, and membership. |
| **Responsive interface** | Use mobile navigation, touch-sized controls, scrollable tables, viewport-aware dialogs, and light/dark themes. |

## Screenshots

Click an image to inspect it at full size.

### Company directory

Company details, assignment, creator attribution, activity, and filtering in one table.

![Companies table with domain and status badges, assigned members, Added by attribution, and pagination](docs/screenshots/companies.png)

### Deal pipeline

The board keeps the same stage-based workflow across desktop and mobile.

![Desktop sponsorship pipeline with companies organized into deal stages](docs/screenshots/pipeline.png)

<details>
<summary><strong>Activity dashboard, team management, and dark mode</strong></summary>

### Activity and follow-ups

![Activity dashboard with a seven-day trend chart, recent interactions, top performers, and follow-up action items](docs/screenshots/activities.png)

### Team management

![Team members table with workspace roles and member actions](docs/screenshots/team.png)

### Dark mode

![SponsCRM dashboard in dark mode](docs/screenshots/dashboard-dark.png)

</details>

### Mobile experience

<table>
  <tr>
    <th>Company directory</th>
    <th>Workspace navigation</th>
    <th>Touch-friendly pipeline</th>
  </tr>
  <tr>
    <td><img src="docs/screenshots/mobile-companies.png" alt="Mobile companies page with stacked filters and a horizontally scrollable table" width="260"></td>
    <td><img src="docs/screenshots/mobile-navigation.png" alt="Mobile navigation drawer showing workspace sections" width="260"></td>
    <td><img src="docs/screenshots/mobile-pipeline.png" alt="Mobile pipeline card with a stage selector" width="260"></td>
  </tr>
</table>

## How the workflow fits together

### From a new workspace to active outreach

```mermaid
flowchart TB
    subgraph Team[1. Form the team]
        direction LR
        A[Register or log in] --> B{Workspace}
        B -->|Create| C[Administrator]
        B -->|Invite code| D[Member]
    end
    subgraph Portfolio[2. Build the portfolio]
        direction LR
        E[Add or import companies] --> F[Review duplicate suggestions]
        F --> G[Assign owners]
    end
    subgraph Outreach[3. Run outreach]
        direction LR
        H[Log interactions] --> I[Schedule follow-ups]
        I --> J[Update deal stages]
        J --> K[Review progress]
        K --> H
    end
    Team --> Portfolio --> Outreach
    Outreach --> L[Administrator manually syncs Google Sheets]
```

### Deal stages

```mermaid
flowchart LR
    A[Not Contacted] --> B[Contacted]
    B --> C[In Talks]
    C --> D[Negotiating]
    D --> E[Positive]
    E --> F[Closed]
    B -.-> G[Rejected]
    C -.-> G
    D -.-> G
    E -.-> G
```

This diagram illustrates a typical outreach journey. The application allows stages to be changed directly; it does not enforce a fixed transition order.

### What happens when an activity is logged

```mermaid
sequenceDiagram
    actor Member
    participant UI as React interface
    participant API as Express API
    participant DB as PostgreSQL via Prisma
    Member->>UI: Log an interaction and optional follow-up
    UI->>API: POST /api/v1/activities
    API->>DB: Check organization and company access
    API->>DB: Create activity and update company in a transaction
    Note over API,DB: Update lastContactedAt and nextFollowUp
    Note over API,DB: NOT_CONTACTED becomes CONTACTED
    DB-->>API: Saved activity
    API-->>UI: Success response
    UI->>API: Refetch affected company and activity queries
    UI-->>Member: Updated records and feedback
```

If a follow-up date is omitted, the backend schedules one day after a call, two days after an email, or three days after a meeting. An explicit date overrides that default.

## Roles and workspace access

| Capability in the interface | Admin | Senior | Member |
| --- | :---: | :---: | :---: |
| Add companies and paste-import prospects | Yes | Yes | Yes |
| Company directory and pipeline | Workspace view | Workspace view | Assigned or self-created companies |
| View who added a company and filter by creator | Yes | Yes | Within the member company view |
| Log interactions and manage follow-ups | Yes | Yes | For accessible companies |
| Individual and bulk company assignment | Yes | Yes | — |
| Organization-wide dashboard statistics | Yes | Yes | Personal dashboard |
| View the team | Yes | Yes | — |
| Change roles and remove team members | Yes | — | — |
| Connect Google and sync Sheets | Yes | — | — |
| Delete companies or the workspace | Yes | — | — |

Creating an organization makes its creator an `ADMIN`; joining an organization sets the user to `MEMBER`. Administrators can change member roles. The application prevents the last administrator from leaving without appointing another administrator.

The table describes the UI workflow. Exact API access checks are defined in the route files and middleware; the company list used by members is `/companies/me`.

### Creator and assignee are different fields

- **`createdById`** identifies the account that originally added or imported the company.
- **`assignedToId`** identifies the account currently managing the company and can be changed or cleared.
- Reassigning a company does not overwrite its creator.
- Creator filter choices come from existing company records, including companies added by former workspace members. Member choices are limited to creators of companies available in their member view.

## Architecture

```mermaid
flowchart TB
    subgraph Client[Frontend - React and Vite]
        Pages[Pages and responsive components]
        Session[Zustand session state]
        Queries[TanStack Query hooks]
        HTTP[Axios with credentials]
        Pages <--> Session
        Pages <--> Queries
        Queries <--> HTTP
    end
    subgraph Server[Backend - Express and TypeScript]
        Routes[Versioned REST routes]
        Auth[JWT authentication and role checks]
        Controllers[Controllers]
        Models[Validation and data operations]
        ORM[Prisma with PostgreSQL adapter]
        Routes --> Auth --> Controllers --> Models --> ORM
    end
    HTTP <-->|JSON over HTTP| Routes
    ORM <--> DB[(PostgreSQL)]
    Controllers <-->|Optional OAuth and manual sync| Google[Google Sheets and Drive APIs]
```

**Request path:** components call reusable query/mutation hooks, Axios sends requests to `/api/v1`, and Express routes delegate to controllers and model functions. Zod validates supported inputs, Prisma performs database operations, and query invalidation refreshes affected UI data after mutations.

Authentication uses a JWT stored in an HttpOnly cookie. The middleware also accepts a bearer token and retrieves the current user from the database. Protected routes use the current organization and, where configured, explicit role restrictions.

## Data model

```mermaid
erDiagram
    Organization o|--o{ User : has_members
    Organization ||--o{ Company : contains
    User ||--o{ Company : creates
    User o|--o{ Company : is_assigned
    Company ||--o{ Activity : has_history
    User ||--o{ Activity : records
    User ||--o{ Notification : receives

    Organization {
        String id PK
        String name
        String inviteCode UK
        String createdById
        String sheetId
        Boolean googleConnected
    }
    User {
        String id PK
        String email UK
        String name
        String password "nullable for Google-only accounts"
        String googleId "nullable, unique"
        Role role
        String orgId FK
    }
    Company {
        String id PK
        String name
        String contactName
        Domain domain
        Status status
        Int amount
        Type type
        String orgId FK
        String createdById FK
        String assignedToId FK
        DateTime nextFollowUp
    }
    Activity {
        String id PK
        ActivityType type
        String note
        String companyId FK
        String userId FK
        DateTime createdAt
    }
    Notification {
        String id PK
        String userId FK
        String orgId
        NotificationType type
        Boolean isRead
    }
```

The diagram highlights the main fields; the complete source of truth is [`schema.prisma`](apps/backend/prisma/schema.prisma).

Company names have a composite unique constraint on `(name, orgId)`. Organization, assignee, status, and domain indexes support common company lookups. Users can have no organization, and companies can have no assignee.

### Dashboard calculations

The administrator statistics endpoint calculates totals from the organization's company records. Closed cash deals contribute to collected cash; closed in-kind deals contribute to in-kind value. The weighted cash pipeline uses these stage weights:

| Stage | Weight |
| --- | ---: |
| Not Contacted | 5% |
| Contacted | 15% |
| In Talks | 35% |
| Negotiating | 60% |
| Positive | 85% |
| Closed | 100% |
| Rejected | 0% |

```text
Weighted cash pipeline = sum(company amount × stage weight), for CASH companies
```

These weights are defined in [`dashboardController.ts`](apps/backend/src/controllers/dashboardController.ts). They are a reporting heuristic. Member dashboard charts are derived from the companies loaded into that view; they are not the same aggregation as the administrator endpoint.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, React Router 7 |
| Styling and components | Tailwind CSS 4, shadcn/ui, Radix UI, Headless UI, Lucide icons, Geist |
| State and data fetching | Zustand, TanStack Query 5, Axios |
| Visualization and feedback | Recharts, Sonner, date-fns |
| API | Node.js, Express 5, TypeScript, Zod 4 |
| Persistence | PostgreSQL, Prisma 7, Prisma PostgreSQL adapter |
| Authentication | JSON Web Tokens, bcrypt, cookie-parser |
| API middleware | Helmet, express-rate-limit, hpp, CORS |
| Integrations | Google OAuth, Google Sheets API, Drive file scope, Fuse.js name matching |
| Monorepo and automation | npm workspaces, Turborepo, GitHub Actions |
| Hosting | Frontend configured for Vercel; backend hosted on Render |

Versions above describe the current package manifests. Use the lockfile for reproducible dependency installation.

## Repository structure

```text
sponsCRM/
├── .github/workflows/backend-ci.yml   # Backend build and regression checks
├── apps/
│   ├── backend/
│   │   ├── prisma/                    # Schema and migration history
│   │   ├── prisma.config.ts          # Prisma datasource configuration
│   │   ├── src/
│   │   │   ├── controllers/          # Request and response handling
│   │   │   ├── models/               # Validation and database operations
│   │   │   ├── routes/               # API routes
│   │   │   ├── lib/prisma.ts         # Prisma client and PostgreSQL adapter
│   │   │   ├── utils/                # Google OAuth and duplicate detection
│   │   │   ├── middleware.ts
│   │   │   ├── app.ts
│   │   │   └── index.ts              # Server entry point
│   │   └── tests/                    # Creator and company-filter regression tests
│   └── frontend/
│       ├── src/
│       │   ├── api/                  # Axios API modules
│       │   ├── hooks/                # Queries, mutations, and shared hooks
│       │   ├── stores/               # Authentication state
│       │   ├── components/           # Layout, companies, dashboards, activity, UI
│       │   ├── pages/                # Application and public pages
│       │   └── App.tsx               # Routes and session initialization
│       └── vercel.json               # SPA route rewrites
├── docs/screenshots/                 # README desktop and mobile images
├── packages/                         # Shared UI and lint/TypeScript configuration
├── package.json
├── package-lock.json
└── turbo.json
```

## Quick start

### 1. Prerequisites

- Node.js **24**, matching the backend CI configuration.
- npm **11**; the root package declares `npm@11.11.0`.
- A running PostgreSQL database and its connection URL.
- Git. Google credentials are optional for the core CRM workflow.

### 2. Clone and install

Run from the repository root:

```bash
git clone https://github.com/itzzfalcon52/sponsCRM.git
cd sponsCRM
npm ci
```

### 3. Configure the environment

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Create a database named `sponscrm`, set `DATABASE_URL` to its connection string, and replace the example `JWT_SECRET` with a long random value. The [environment reference](#environment-variables) explains each setting.

### 4. Apply the schema and generate the client

Run Prisma commands from the backend directory so its configuration and environment are loaded:

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
cd ../..
```

`migrate deploy` applies the checked-in migrations. When developing a new schema change, use `npx prisma migrate dev --name describe_your_change` from `apps/backend` to create a migration instead.

### 5. Start development

```bash
npm run dev
```

| Service | Local address |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend root | `http://localhost:3000` |
| API base | `http://localhost:3000/api/v1` |

The backend root returns a simple text response; it does not test database connectivity.

For separate terminals:

```bash
npm run dev --workspace backend
```

```bash
npm run dev --workspace frontend
```

### 6. Create your first workspace

1. Register an account in the UI.
2. Create an organization to become its administrator.
3. Share the workspace invite code with your team.
4. Add a company or use **Import Excel** to paste spreadsheet rows.
5. Assign a member, log an interaction, and review the pipeline and follow-ups.

No preconfigured demo login or database seed is included.

## Environment variables

### Backend — `apps/backend/.env`

| Variable | Required | Purpose / local example |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string, such as `postgresql://postgres:postgres@localhost:5432/sponscrm`. |
| `JWT_SECRET` | Yes | Signing secret; replace the example with a long random value. |
| `JWT_EXPIRES_IN` | Yes | Token lifetime, for example `7d`. |
| `JWT_COOKIE_EXPIRES_IN` | Yes | Cookie lifetime in days, for example `7`. |
| `PORT` | No | Server port; defaults to `3000`. |
| `NODE_ENV` | No | Use `development` locally and `production` on the hosted backend. Production enables secure session cookies. |
| `GOOGLE_SIGN_IN_CLIENT_ID` | For Google login | Public web OAuth client ID; must exactly match the frontend sign-in client ID. No client secret is required for login. |
| `GOOGLE_CLIENT_ID` | For Sheets | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | For Sheets | Google OAuth client secret. |
| `GOOGLE_REDIRECT_URI` | For Sheets | Callback URL ending in `/api/v1/google/callback`. |

### Frontend — `apps/frontend/.env`

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Complete API base, including `/api/v1`. Defaults to `http://localhost:3000/api/v1`. |
| `VITE_GOOGLE_SIGN_IN_CLIENT_ID` | Optional public web OAuth client ID, matching backend `GOOGLE_SIGN_IN_CLIENT_ID`. Without it, Google buttons are hidden and password login remains available. |

Vite embeds its environment configuration at build time. Rebuild the frontend after changing either frontend environment variable. Frontend environment values are visible to the browser; server secrets belong only in the backend environment.

## Google sign-in

Google sign-in uses Google Identity Services and the existing SponsCRM sessions. It does not require Clerk, replace the user database, or request access to Sheets/Drive. Email/password login remains available.

### Configure Google

1. In Google Cloud / Google Auth Platform, configure the consent screen and create an OAuth client of type **Web application**. A separate client from Sheets makes the two integrations easier to manage.
2. Add your frontend origins under **Authorized JavaScript origins**: `http://localhost:5173`, `https://www.sponscrm.tech`, `https://sponscrm.tech`, and your Vercel origin if you use it. Origins have no path. Only add domains you control.
3. Set backend `GOOGLE_SIGN_IN_CLIENT_ID` and frontend `VITE_GOOGLE_SIGN_IN_CLIENT_ID` to that same client ID. The frontend value is public. No client secret or backend redirect URI is needed for this popup flow.
4. While the Google consent app is in testing, add the intended Google accounts as test users where required. Publish the consent app for the intended audience before inviting everyone.
5. Deploy the backend with the startup command below, and rebuild/deploy the frontend. **Continue with Google** appears on both login and registration pages.

If your frontend uses a Content Security Policy, allow the Google Identity Services script/frame/connect endpoints described in [Google's setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid). If your host sends `Cross-Origin-Opener-Policy: same-origin`, use `same-origin-allow-popups` for the popup flow. Network/ad blockers may prevent Google from loading; the UI offers retry and password login.

### Existing users and data preservation

- On the first Google sign-in with a matching email (case-insensitive), an existing user must confirm their **current CRM password**. Signup did not verify email ownership, so matching emails alone never trigger an automatic merge.
- Successful linking only sets the nullable, unique `User.googleId`. User IDs, email, name, password hash, organization, role, creator/assignee relationships, activities and notifications stay in place. Existing users can keep using their original password after linking.
- Later Google logins identify that same account using Google's immutable subject (`sub`). A changed Google email does not create a replacement account or change the stored CRM email.
- A brand-new Google identity with no matching CRM account creates a `MEMBER` account without an organization or local password. The user follows the existing create/join organization flow. Its profile explains that password management belongs to the Google Account.
- Different Google subjects cannot overwrite an existing link. Ambiguous legacy emails and concurrent linking conflicts are rejected instead of merging records.
- Google Sheets connections, permissions and organization tokens are independent and continue using the existing integration.

### Deploy safely with existing accounts

The migration `20261020120000_add_google_sign_in` adds nullable `googleId`, creates its unique index, and allows nullable passwords for new Google-only users. It contains no delete, truncate, ID replacement, password rewrite or user backfill.

1. Take your normal production database backup before a schema deployment. Keep the current `DATABASE_URL` and `JWT_SECRET` so the same database and existing sessions are used.
2. Set the Render start command to `npm start --workspace backend`. Its `prestart` script runs `prisma migrate deploy` before the compiled server starts. A migration failure stops the new server from starting against an outdated schema. To apply migrations separately (for example, in a Render pre-deploy command), run:

   ```bash
   npm exec --workspace backend -- prisma migrate deploy
   ```

3. Deploy the backend with the matching Google client ID, then deploy the frontend with its matching public client ID. Test an existing account's password login, first-time linking, next Google login, organization access and company history. Test a new Google account separately.

Do not use `prisma migrate reset` or recreate the database. For a rollback, hide the frontend Google button first and keep the migrated schema; older password-only code cannot authenticate newly created Google-only accounts. Existing password hashes remain unchanged.

### Verification and API behavior

`POST /api/v1/auth/google` accepts JSON `{ "credential": "<Google ID token>", "currentPassword": "<only for first-time linking>" }`. The Google client library checks the token's signature, issuer, audience and expiry. A verified email is required. The endpoint is rate limited, rejects non-JSON form submissions, and issues the same HttpOnly session cookie as password login. Google sign-in ID tokens are not persisted in browser storage or returned in API responses.

An existing unlinked account returns HTTP `409` with `code: "GOOGLE_LINK_REQUIRED"`; the UI then requests the password. A bad password leaves the account unchanged. When backend Google configuration is absent, the endpoint returns `503` and password login continues to work.

The authentication regression tests run offline with fictional users and locally signed test tokens, while using the real Google token verifier. They cover invalid signatures/audiences/issuers/expiry, unverified emails, preserved account fields, password login after linking, new Google-only users, profile handling and conflicts. A real Google account and configured OAuth client are still needed to validate Google's consent screen end to end.

Official references: [Google button integration](https://developers.google.com/identity/gsi/web/guides/display-button), [server token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Google Sheets integration

Google integration is optional. Companies, assignments, dashboards, and activities work without it.

1. Create or select a Google Cloud project and enable the **Google Sheets API** and **Google Drive API**.
2. Configure the OAuth consent screen and create a web application OAuth client.
3. Add your backend callback URL to the client's authorized redirect URIs. For local testing, use `http://localhost:3000/api/v1/google/callback`.
4. Set the three `GOOGLE_*` backend variables.
5. As an administrator, open **Companies → Connect Google** and complete consent.
6. Use the Google sync action to create or update the organization's spreadsheet.

The code requests `spreadsheets` and `drive.file` scopes with offline access. The organization stores its connection information and spreadsheet ID. Sync groups company records by domain and writes **Company**, **Contact**, **Phone**, **Status**, and **Assigned To** columns.

**Sync is manual and one-way: CRM → Google Sheets.** Editing a sheet does not update CRM records. If Google authorization expires, the UI can prompt a reconnect while retaining the existing spreadsheet ID.

**Local callback note:** the current callback redirects to `https://www.sponscrm.tech/companies`. To finish OAuth entirely in a local environment, adjust that redirect in [`exportCompaniesController.ts`](apps/backend/src/controllers/exportCompaniesController.ts).

## API reference

**Base:** `/api/v1`. The browser sends session cookies through Axios with `withCredentials: true`. Protected API requests can also use `Authorization: Bearer <token>`.

The tables below describe the implemented routes. “Organization member” means an authenticated account with an organization; it does not imply an additional administrator restriction unless listed.

<details>
<summary><strong>Authentication and profile</strong></summary>

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register and start a session | Public, rate limited |
| POST | `/auth/login` | Sign in with email/password | Public, rate limited |
| POST | `/auth/google` | Google sign-in/signup; first-time legacy linking requires the existing password | Public, rate limited |
| POST | `/auth/logout` | Clear the session cookie | No authentication middleware |
| GET | `/auth/me` | Read the current account | Authenticated |
| PATCH | `/auth/update-me` | Update profile name | Authenticated |
| PATCH | `/auth/change-password` | Change password and clear the cookie | Authenticated |
| DELETE | `/auth/delete-me` | Delete the current account | Authenticated |

</details>

<details>
<summary><strong>Organizations and team management</strong></summary>

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| POST | `/org/create` | Create a workspace | Authenticated |
| POST | `/org/join` | Join with `inviteCode` | Authenticated |
| GET | `/org/members` | List workspace members | Admin / Senior |
| PATCH | `/org/members/:memberId/role` | Change member role | Admin |
| DELETE | `/org/members/:memberId` | Remove a member | Admin |
| PATCH | `/org/update` | Update workspace details | Admin |
| POST | `/org/leave` | Leave the workspace | Authenticated; last-admin protection |
| DELETE | `/org/delete` | Delete the workspace and its company data | Admin |

</details>

<details open>
<summary><strong>Companies</strong></summary>

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| GET | `/companies` | List organization companies | Organization member |
| GET | `/companies/me` | List companies assigned to or created by the current user | Organization member |
| GET | `/companies/creators` | Get creator filter options | Organization member; member visibility applied |
| GET | `/companies/search/duplicates` | Find similar names using `name` | Organization member |
| GET | `/companies/:id` | Read a company within the organization | Organization member |
| POST | `/companies` | Add a company | Organization member |
| POST | `/companies/bulk-import` | Import a batch with one domain | Organization member |
| PATCH | `/companies/:id` | Update a company within the organization | Organization member |
| PATCH | `/companies/:id/assign` | Assign or unassign a company | Admin / Senior |
| PATCH | `/companies/bulk-assign` | Assign or unassign multiple companies | Admin / Senior |
| DELETE | `/companies/:id` | Delete a company | Admin |

#### List filters

| Parameter | Meaning |
| --- | --- |
| `q` | Case-insensitive company name or contact name search. |
| `status` | One of the seven status enum values. |
| `domain` | A domain enum value, such as `EDTECH`, `FINTECH`, or `AI_TECH`. |
| `createdBy` | Creator UUID; supported by both list endpoints. |
| `assignedTo` | Assignee ID on the organization list endpoint. |
| `page` | Page number; defaults to `1`. |
| `limit` | Page size; defaults to `20`, with a maximum of `100`. |

Example: `GET /api/v1/companies?status=IN_TALKS&domain=AI_TECH&page=1&limit=10`

List responses include `data` and `pagination` (`total`, `page`, and `totalPages`). The UI sends a page size of 10 for the companies directory.

</details>

<details>
<summary><strong>Activities, reporting, notifications, and Google</strong></summary>

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| POST | `/activities` | Log a call, email, or meeting | Organization member; company access checked |
| GET | `/activities/company/:companyId` | Read company activity history | Organization member |
| GET | `/activities/all` | Read recent activities | Organization member; members receive their own activity records |
| GET | `/activities/followups` | Read overdue and due-today follow-ups | Organization member; members scoped to assigned companies |
| GET | `/dashboard/stats` | Read organization dashboard statistics | Admin / Senior |
| GET | `/notifications` | Read unread notifications | Authenticated |
| PATCH | `/notifications/:id/read` | Mark a notification as read | Authenticated |
| PATCH | `/notifications/mark-all` | Mark notifications as read | Authenticated |
| GET | `/google/connect` | Start Google OAuth | Admin |
| GET | `/google/callback` | Handle Google OAuth response | OAuth callback |
| POST | `/google/sync` | Sync organization records to Sheets | Admin |

</details>

### Example: add a company

With an authenticated session cookie:

```bash
curl -X POST http://localhost:3000/api/v1/companies \
  -b cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Northstar Labs",
    "contactName": "Priya Kapoor",
    "email": "partnerships@example.com",
    "domain": "AI_TECH",
    "status": "NOT_CONTACTED",
    "type": "CASH",
    "amount": 120000
  }'
```

`cookies.txt` must come from a preceding login or registration request using `curl -c cookies.txt`. `createdById` and `orgId` are set by the backend from the authenticated account.

A fuzzy duplicate match produces a `409` warning with name suggestions. After reviewing it, a caller can explicitly retry with `force: true`; the database still rejects an exact duplicate name in the same organization.

### Spreadsheet import format

The **Import Excel** dialog accepts pasted, tab-separated rows in this order, without a header:

| Company name | POC name | LinkedIn URL | Phone number | Email |
| --- | --- | --- | --- | --- |
| Northstar Labs | Priya Kapoor | optional | optional | partnerships@example.com |

Select a domain for the batch and review the preview before importing. Always provide a company name and a contact name of at least two characters to satisfy backend validation.

The API expects:

```json
{
  "domain": "AI_TECH",
  "companies": [
    {
      "name": "Northstar Labs",
      "contactName": "Priya Kapoor",
      "email": "partnerships@example.com"
    }
  ]
}
```

Imports run in a transaction. The schema allows up to 500 companies per request, but the API's current **10 KB JSON body limit** can require smaller batches. This is clipboard import; the current UI does not upload `.xlsx` files.

## Development and verification

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend through Turborepo. |
| `npm run build` | Build both applications. |
| `npm run build --workspace frontend` | Type-check and bundle the React application. |
| `npm run build --workspace backend` | Generate Prisma Client and compile the API. |
| `npm test --workspace backend` | Run backend regression tests. |
| `npm run lint --workspace frontend` | Run frontend ESLint checks. |
| `npm run format` | Format supported source and Markdown files; this writes changes. |
| `npm start --workspace backend` | Start the compiled API after a build. |

The backend test suite exercises creator filtering, combined filters, pagination, attribution on individual additions and imports, and the creator route's authentication and visibility behavior. Database calls are stubbed; the suite does not migrate or modify a live database. Route tests open a temporary loopback HTTP server.

Frontend lint currently reports pre-existing findings. A passing production build is separate from a clean lint result. The root `check-types` task depends on workspace scripts; the application build commands above provide the actual application type checks.

### CI

[Backend checks](.github/workflows/backend-ci.yml) runs on pushes and pull requests to `main`, or by manual dispatch. It installs backend dependencies from the lockfile, generates Prisma Client, builds the backend, and runs regression tests on Node.js 24.

## Deployment

### Frontend — Vercel

Use the repository as a monorepo project and select `apps/frontend` as the frontend root directory. Install dependencies from the workspace root and build the frontend workspace. The Vite output directory is `dist` relative to `apps/frontend`.

Set `VITE_API_URL` to the public backend API base, including `/api/v1`. [`apps/frontend/vercel.json`](apps/frontend/vercel.json) rewrites application routes to `index.html`, allowing direct navigation to routes such as `/companies` and `/pipeline`.

### Backend — Render

For a setup that builds from the repository root:

| Setting | Value |
| --- | --- |
| Service type | Node.js web service |
| Branch | `main` |
| Build command | `npm ci --workspace backend --include-workspace-root && npm run build --workspace backend` |
| Start command | `npm start --workspace backend` |
| Node version | `24` |
| Runtime environment | Backend variables from the environment reference; use `NODE_ENV=production`. |

The backend `prestart` script automatically runs `prisma migrate deploy` when using the start command above. It must complete before the updated server starts, even when Google sign-in is disabled. If Render uses a custom command such as `npx tsx src/index.ts`, switch to the documented `npm start --workspace backend` command or configure migrations as a separate pre-deploy step. To apply migrations separately from the repository root:

```bash
cd apps/backend && npx prisma migrate deploy
```

Render can deploy directly from its linked GitHub branch. GitHub Actions validates the backend; it does not SSH into a separate server. Render's **After CI Checks Pass** option can gate deployment on the GitHub checks.

```mermaid
flowchart LR
    Commit[Push to GitHub main] --> CI[GitHub Actions: backend build and tests]
    Commit --> Frontend[Vercel: frontend build and deploy]
    Commit --> Backend[Render: backend build and deploy]
    CI -.->|Optional deployment gate| Backend
    Frontend --> Browser[Browser application]
    Browser <-->|API requests| Backend
    Backend <--> Database[(PostgreSQL)]
```

The deployment diagram describes the configured hosting pattern; automatic deploy behavior is controlled in each hosting dashboard.

### Origins and session cookies

Allowed frontend origins are currently listed in [`apps/backend/src/app.ts`](apps/backend/src/app.ts). Add the intended frontend origin when hosting a fork. The frontend must send credentials, the API must allow that origin, and the cookie policy must suit the chosen domains and HTTPS configuration. Current session cookies use `HttpOnly`, `SameSite=lax`, and `Secure` in production.

Further configuration details: [Render deploys](https://render.com/docs/deploys), [Vercel monorepos](https://vercel.com/docs/monorepos), and [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Prisma Client cannot be imported | Run `npx prisma generate` from `apps/backend`. The generated client is intentionally ignored by Git. |
| Database queries fail | Check that PostgreSQL is reachable, `DATABASE_URL` points to the intended database, and migrations have been applied. |
| “JWT environment variables not set” | Set both `JWT_SECRET` and `JWT_EXPIRES_IN` in the backend environment. |
| Requests reach the wrong API | Verify that `VITE_API_URL` includes `/api/v1`, then rebuild the frontend. |
| Login does not persist | Inspect HTTPS, cookie attributes, credentialed requests, and the allowed frontend origins. |
| Access is denied after login | Join or create an organization and verify the account's role for the requested action. |
| Import is rejected | Provide company/contact names, choose a valid domain, check email formatting and duplicates, and reduce the batch size if it exceeds the body limit. |
| Google sign-in button missing | Set `VITE_GOOGLE_SIGN_IN_CLIENT_ID` and rebuild the frontend. |
| Google sign-in rejected or origin not allowed | Match the frontend/backend sign-in client IDs, register the exact frontend JavaScript origin, and check Google consent/test-user settings. |
| Existing account requests a password when choosing Google | Confirm the existing CRM password once; this safely links Google without creating another account. |
| Google OAuth redirect mismatch | Match `GOOGLE_REDIRECT_URI` exactly to the OAuth client's authorized callback URL. |
| Local OAuth returns to the hosted site | Update the hardcoded frontend redirect described in the Google integration section. |
| Google sync requests a reconnect | Reauthorize the administrator's Google connection and retry sync. |
| A deep link returns 404 on the frontend host | Ensure the SPA rewrite configuration is deployed. |

## Contributing

1. Create a focused branch from `main`.
2. Keep frontend API modules, hooks, and backend route/model behavior consistent.
3. Include a Prisma migration when changing the persistent schema.
4. Verify the relevant build and regression checks.
5. For UI changes, check phone, tablet, desktop, light, and dark appearances, including dialogs and navigation.
6. Open a pull request describing the behavior change and how it was verified.

Use fictional data in screenshots and examples. Keep environment files, credentials, generated clients, and build outputs out of commits.

---

<div align="center">

Built for teams that turn conversations into partnerships.

[Open SponsCRM](https://www.sponscrm.tech) · [Report an issue](https://github.com/itzzfalcon52/sponsCRM/issues) · [Source code](https://github.com/itzzfalcon52/sponsCRM)

</div>
