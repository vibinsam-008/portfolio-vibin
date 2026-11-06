# Vibin Apapchi A — Engineering Portfolio

A high-performance personal developer portfolio and engineering workspace built with a Cyberpunk 2077-inspired dark interface, signature neon yellow accents (`#FCEE0A`), holographic glass panels, and an interactive Three.js 3D geometric HUD.

Includes a private, persistent Admin Content Management Dashboard at `/admin` that allows full editing of projects, bio, tech stack, learning tracks, principles, and contact inquiries without modifying source code or redeploying.

Hosted on Netlify with shared database storage, image storage, and verified administrator authentication.

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons.
- **3D Graphics & HUD**: Three.js WebGL canvas displaying an interactive 3D polyhedral wireframe with real-time mouse tilt and coordinate tracking.
- **Backend & API**: Netlify Functions at `/api/*`.
- **Persistence**: Netlify Database with Drizzle ORM for published portfolio content and inquiries; Netlify Blobs for uploaded images.
- **Authentication**: Netlify Identity. Writes require the confirmed owner email or a server-assigned admin role.
- **Build Tool**: Vite 8.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 22+ and Netlify CLI installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
netlify dev --port 8889
```
Open `http://localhost:8889` for the frontend and Netlify APIs. `npm run dev` starts the frontend only.

---

## Administrator Account & Dashboard (`/admin`)

The portfolio includes a secure private admin interface accessible by clicking the **Admin** button in the header or navigating to `/admin`.

### First Sign-in
Use **Create owner account** with `vibinappachi@gmail.com` and a new password, then confirm the email link and sign in. The old browser-only password and sessions no longer authorize publishing. Other administrators require a server-assigned `admin` role in Netlify Identity.

Use **Reset password** to receive a recovery email. After opening the link, open the dashboard's **Security** tab to set a new password. The owner email stays unchanged.

### Recovering Earlier Browser-only Edits
On the original device, sign in to recover the locally stored portfolio as an unsaved draft. Review it and click **Publish Live** once to save it for everyone. Other devices load published content from the server; active pages refresh every 15 seconds and on window focus. Failed saves keep the draft and show an error.

---

## Admin Workspace Capabilities

The `/admin` dashboard allows updating all content on the live site:

1. **Project Repository Manager**:
   - Add new projects with custom categories and status tags (`Concept`, `In Progress`, `Prototype`, `Deployed`, `Archived`).
   - Reorder projects or toggle featured status.
   - Upload project cover images directly from your computer or supply image URLs.
   - Fill in the 10-section engineering case study:
     1. Problem Statement
     2. Intended Users
     3. Why The Problem Matters
     4. System Architecture
     5. Technical Decisions & Trade-Offs
     6. Implementation Details
     7. Challenges & Debugging
     8. Current Limitations
     9. Validation & Results
     10. Future Improvements
2. **Identity & Bio**:
   - Edit full name, academic role, graduation year, availability status badge.
   - Customize hero display headlines and bio narrative.
   - Add, edit, or remove lines in the terminal focus console.
3. **Tech Stack**:
   - Add tools across 7 categories (Languages, Frontend, Backend, AI & ML, Visualization & Graphics, Developer Tools, Currently Learning).
   - Set honest proficiency levels: `Building with`, `Learning`, or `Exploring` (no arbitrary fake percentages).
4. **Learning Tracks**:
   - Add, prioritize, or archive active computer science and systems focus areas.
5. **Engineering Principles**:
   - Customize the 4 core engineering heuristics.
6. **Inquiry Inbox**:
   - Read, mark as read, and manage direct transmissions sent by visitors via the Contact form.
7. **Draft & Preview Mode**:
   - Make edits in draft mode, review how they look live, and click **Save & Publish Live** to push updates to all visitors.

---

## Deployment on Netlify

The site publishes `dist` and deploys the functions in `netlify/functions`. Identity is enabled for the project. Database migrations in `netlify/database/migrations` are applied automatically during deployment. Preview databases are isolated from production. No redeploy is needed after publishing content in the dashboard.

Define schema changes in `db/schema.ts` and generate migrations using `npx drizzle-kit generate --name describe_change`. Do not apply migrations manually.

Uploaded images support PNG, JPG, WEBP, and GIF up to 4MB each. Contact messages are stored in the shared database and are visible to signed-in administrators on every device. Unsuccessful submissions show an error and keep the entered message.

Run `npm run lint` for TypeScript verification. The legacy `server.ts` is not used by the Netlify deployment or development command.

---

## License & Attribution
Designed and built for **Vibin Apapchi A**, CSE Undergraduate at Madras Institute of Technology, Chennai.
Licensed under the Apache-2.0 License.
