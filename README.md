<div align="center">

# 🧪 Dakflo

**Modern Clinical Sample Collection & Lab Review Platform**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=auth0&logoColor=white)

*Streamlining clinical workflows from field collection to lab approval*

</div>

---

## 🌟 Overview

Dakflo is a comprehensive, role-based clinical sample collection and lab review platform built with Next.js. Our system empowers field collectors, lab technicians, and administrators to efficiently manage the entire sample lifecycle—from collection to analysis.

### ✨ Key Features

- 🎯 **Role-Based Access Control** — Secure, tailored interfaces for each user type
- 🔐 **Enterprise Authentication** — Powered by NextAuth for robust session management
- 📊 **Real-Time Data Management** — MongoDB-backed models for seamless data flow
- 📱 **Modern UI/UX** — Clean, responsive design optimized for clinical workflows
- 🚀 **API-First Architecture** — Modular endpoints for scalable integrations

### 🎭 User Roles & Capabilities

| Role | Capabilities |
|------|-------------|
| 👨‍💼 **Admin** | User management, system configuration, analytics dashboard |
| 👩‍⚕️ **Field Collector** | Patient registration, sample collection, file uploads |
| 🔬 **Lab Technician** | Sample review, approval/rejection workflows, quality control |
| 🏥 **Patient** | Personal results access, profile management |
| 🎓 **External Expert** | Read-only access, sample annotation, consultation |

## Key Concepts & Roles
- Admin: manage users and system settings.
- Field Collector: create patient records, collect samples, upload files.
- Lab Tech: review, approve, or reject submitted samples.
- Patient: view personal results and profile.
- External Expert: view or annotate samples (read-only or limited access).

## 🛠️ Tech Stack

<table>
<tr>
<td align="center"><strong>Frontend</strong></td>
<td align="center"><strong>Backend</strong></td>
<td align="center"><strong>Database</strong></td>
<td align="center"><strong>Auth</strong></td>
</tr>
<tr>
<td align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" /><br>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" /><br>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
</td>
<td align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white" /><br>
  <img src="https://img.shields.io/badge/API_Routes-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
</td>
<td align="center">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white" /><br>
  <img src="https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white" />
</td>
<td align="center">
  <img src="https://img.shields.io/badge/NextAuth.js-000000?style=flat-square&logo=auth0&logoColor=white" /><br>
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
</td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Charles787205/dakflo.git
cd dakflo

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### Development Setup

```bash
# Start development server
npm run dev

# Open your browser
# → http://localhost:3000
```

### 🎭 Demo Data (Optional)

```bash
# Seed sample users for testing
node scripts/seed-users.js
```

> 💡 **Tip**: After seeding, you can log in with different role-based accounts to explore the full feature set.

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/dakflo
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dakflo

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Additional auth providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

<details>
<summary>📋 <strong>Environment Variables Reference</strong></summary>

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb://localhost:27017/dakflo` |
| `NEXTAUTH_SECRET` | NextAuth.js encryption key | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application base URL | ✅ | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ❌ | From Google Console |

</details>

## 📜 Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | 🚀 Start development server | Local development |
| `npm run build` | 🔨 Build production bundle | Pre-deployment |
| `npm run start` | ▶️ Run production server | Production |
| `npm run lint` | 🔍 Check code quality | CI/CD pipeline |
| `npm run type-check` | 📝 TypeScript validation | Development |

## 🏗️ Project Architecture

<details>
<summary>📁 <strong>Directory Structure</strong></summary>

```
dakflo/
├── 📱 app/                    # Next.js App Router
│   ├── 🔐 api/               # Serverless API endpoints
│   │   ├── admin/            # Admin management routes
│   │   ├── auth/             # Authentication handlers
│   │   ├── field_collector/  # Sample collection APIs
│   │   ├── lab_tech/         # Lab review workflows
│   │   └── patient/          # Patient data access
│   ├── 👨‍💼 admin/             # Admin dashboard pages
│   ├── 👩‍⚕️ field_collector/   # Field collection interface
│   ├── 🔬 lab_tech/          # Lab technician workspace
│   └── 🏥 patient/           # Patient portal
├── 🧩 components/            # Reusable UI components
├── 📚 lib/                   # Utility functions & DB connection
├── 📊 models/                # Data schemas (User, Patient, Sample)
├── 🔧 scripts/               # Database seeding & utilities
└── 🎨 public/                # Static assets
```

</details>

## 🔐 Authentication & Security

Dakflo implements enterprise-grade security through NextAuth.js with role-based access control (RBAC).

### Security Features
- 🛡️ **Session Management** — Secure JWT-based authentication
- 🎯 **Role-Based Access** — Granular permissions per user type
- 🔒 **Route Protection** — Server-side and client-side guards
- 📱 **Multi-Provider Support** — Email, Google, and custom providers

### Data Flow & APIs

```mermaid
graph TD
    A[👩‍⚕️ Field Collector] --> B[📤 Sample Upload API]
    B --> C[📊 MongoDB]
    C --> D[📋 Lab Review Queue]
    D --> E[🔬 Lab Technician]
    E --> F[✅ Approval/Rejection]
    F --> G[📱 Patient Notification]
```

**Key API Endpoints:**
- `POST /api/field_collector/sample-collection` — Submit new samples
- `GET /api/lab_tech/review-sample` — Fetch pending reviews
- `PUT /api/lab_tech/review-sample` — Update sample status
- `GET /api/admin/users` — User management (admin only)

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Charles787205/dakflo)

```bash
# Production build
npm run build
npm run start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup

Ensure these variables are set in production:
- ✅ `MONGODB_URI` (production database)
- ✅ `NEXTAUTH_SECRET` (secure random string)
- ✅ `NEXTAUTH_URL` (your production domain)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/dakflo.git
   cd dakflo
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes & Test**
   ```bash
   npm run dev
   npm run lint
   npm run type-check
   ```

4. **Submit Pull Request**
   - Keep changes focused and atomic
   - Add tests for new functionality
   - Update documentation as needed

### 📋 Code Standards

- **TypeScript** — Strict type checking enabled
- **ESLint** — Consistent code formatting
- **Conventional Commits** — Clear commit messaging
- **Component Design** — Reusable, accessible components

## 🗺️ Code Navigation

<table>
<tr>
<td><strong>🎯 Feature</strong></td>
<td><strong>📁 Location</strong></td>
<td><strong>📝 Description</strong></td>
</tr>
<tr>
<td>🏠 Landing Page</td>
<td><a href="app/page.tsx">app/page.tsx</a></td>
<td>Main entry point & role selection</td>
</tr>
<tr>
<td>👨‍💼 Admin Dashboard</td>
<td><a href="app/admin">app/admin/</a></td>
<td>User management & system config</td>
</tr>
<tr>
<td>👩‍⚕️ Field Collection</td>
<td><a href="app/field_collector">app/field_collector/</a></td>
<td>Sample collection workflows</td>
</tr>
<tr>
<td>🔬 Lab Interface</td>
<td><a href="app/lab_tech">app/lab_tech/</a></td>
<td>Review & approval workspace</td>
</tr>
<tr>
<td>🔐 Authentication</td>
<td><a href="providers/AuthProvider.tsx">providers/AuthProvider.tsx</a></td>
<td>NextAuth configuration & context</td>
</tr>
<tr>
<td>📊 Database Models</td>
<td><a href="models/">models/</a></td>
<td>User, Patient, Sample schemas</td>
</tr>
</table>

## 📄 License & Support

### 📜 License
This project is licensed under the [MIT License](LICENSE) — see the file for details.

### 💬 Getting Help

- 🐛 **Bug Reports**: [Open an issue](https://github.com/Charles787205/dakflo/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/Charles787205/dakflo/discussions)
- 📧 **Direct Contact**: Reach out via GitHub

### 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org) — The React Framework
- [NextAuth.js](https://next-auth.js.org) — Authentication for Next.js
- [MongoDB](https://mongodb.com) — Document Database
- [TypeScript](https://typescriptlang.org) — JavaScript with Types

---

<div align="center">

**⭐ Star this repo if Dakflo helps your clinical workflows!**

Made with 🧪 for better healthcare technology

</div>
