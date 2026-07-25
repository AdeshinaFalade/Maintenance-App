# University Maintenance System

A full-stack, role-based Web Application built to streamline and digitize the process of submitting, tracking, and resolving maintenance requests within a university environment.

## 🚀 Features
- **Role-Based Access Control (RBAC):** Secure environments for Students, Staff, Maintenance Officers, and Administrators.
- **Service Request Portal:** Users can seamlessly submit maintenance tickets including detailed descriptions, locations, and photographic evidence.
- **Admin Dashboard:** Total oversight of the system. Admins can manage all users, assign roles, assign tickets to specific maintenance officers, and dynamically manage request categories.
- **Maintenance Dashboard:** Dedicated portal for Maintenance Officers to track their assigned tasks and update statuses (Pending, In Progress, Resolved).
- **Immutable Audit Trail:** All status updates are permanently logged with timestamps and the updater's name to ensure full accountability.
- **Cloud Media Storage:** Direct streaming of image uploads to Cloudinary for robust and reliable evidence tracking.

## 🛠️ Technology Stack
- **Frontend:** Next.js 15 (App Router), React, Raw CSS (Glassmorphism UI)
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL hosted on Heroku
- **ORM:** Prisma ORM
- **Authentication:** NextAuth.js (Credentials Provider with bcryptjs)
- **Storage:** Cloudinary SDK

## ⚙️ Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/maintenance-app.git
cd maintenance-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add the following keys:
```env
DATABASE_URL="postgres://your_local_or_remote_postgres_url"
NEXTAUTH_SECRET="your_super_secret_key"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
```

### 4. Setup the Database
Push the Prisma schema to your database and seed it with the default categories and Super Admin account.
```bash
npx prisma db push
npx prisma db seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default Admin Account
When you run the seed command, a master Admin account is generated:
- **Email:** `admin@miva.edu`
- **Password:** `SecurePass123!`

## ☁️ Deployment
This application is fully optimized for cloud hosting environments like Heroku, Vercel, or Render. Ensure that `npx prisma generate` runs during the build step and that you apply all necessary environment variables in your cloud provider's dashboard.
