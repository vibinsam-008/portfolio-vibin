# Vibin Apapchi A — Engineering Portfolio

A high-performance personal developer portfolio and engineering workspace built with a Cyberpunk 2077-inspired dark interface, signature neon yellow accents (`#FCEE0A`), holographic glass panels, and an interactive Three.js 3D geometric HUD.

Includes a private, persistent Admin Content Management Dashboard at `/admin` that allows full editing of projects, bio, tech stack, learning tracks, principles, and contact inquiries without modifying source code or redeploying.

Designed with zero external vendor lock-in so it can be deployed seamlessly to **any host** (Node.js VPS, Docker, Cloud Run, Railway, Render, Fly.io, Vercel, etc.).

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons.
- **3D Graphics & HUD**: Three.js WebGL canvas displaying an interactive 3D polyhedral wireframe with real-time mouse tilt and coordinate tracking.
- **Backend & API**: Express with full-stack Node.js server (`server.ts`).
- **Persistence & Security**:
  - Encrypted password hashing using Node.js native `crypto.scryptSync`.
  - Cryptographic session token verification.
  - Portable persistent data storage in `data/portfolio.json`, `data/admin.json`, and `data/inquiries.json`.
  - High-resolution image asset upload handler in `/uploads` with strict mime-type validation and 5MB size boundaries.
- **Build Tool**: Vite 8.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The server starts at `http://localhost:3000`.

---

## Administrator Account & Dashboard (`/admin`)

The portfolio includes a secure private admin interface accessible by clicking the **Admin** button in the header or navigating to `/admin`.

### Default Credentials
- **Email**: `vibinappachi@gmail.com`
- **Master Password**: `vibin2030` *(or configure via `ADMIN_PASSWORD` in `.env`)*

### Updating Admin Credentials
1. Log in to the Admin Dashboard.
2. Select the **Security** tab from the left sidebar.
3. Enter your updated email and a new master password (minimum 6 characters).
4. Click **Update Admin Password**.

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

## Deployment to Any Host

This repository is self-contained and requires no external proprietary services to run.

### Option A: Standard Node.js Host (VPS, Render, Railway, Fly.io)
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
3. Set environment variables:
   - `PORT=3000` (or host provided)
   - `ADMIN_PASSWORD=your_secure_password`
   - `JWT_SECRET=your_jwt_random_secret`

### Option B: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option C: Google Cloud Run
Deploy with a single command:
```bash
gcloud run deploy vibin-portfolio \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## Troubleshooting Common Issues

1. **How do I reset my admin password if forgotten?**
   Delete `data/admin.json` while the server is stopped, set `ADMIN_PASSWORD="newpassword"` in `.env`, and restart the server. It will recreate the admin credentials automatically.
2. **Images not showing up?**
   Uploaded images are stored in `/uploads` and served statically. Ensure the `uploads/` directory has write permissions on your hosting environment.
3. **Port conflict?**
   Set `PORT=8080` or any available port in your environment variables.

---

## License & Attribution
Designed and built for **Vibin Apapchi A**, CSE Undergraduate at Madras Institute of Technology, Chennai.
Licensed under the Apache-2.0 License.
