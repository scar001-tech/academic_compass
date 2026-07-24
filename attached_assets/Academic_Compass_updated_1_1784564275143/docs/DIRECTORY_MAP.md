# 📂 Project Structure - Complete Directory Map

## Root Project Layout

```
Academic Compass/
│
├── 📁 apps/                                 # Main applications
│   ├── 📁 website/                          # Public School Website
│   │   ├── 📁 src/
│   │   │   ├── 📁 pages/                   # [HomePage.tsx]
│   │   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── 📁 layouts/                 # [AppLayout.tsx]
│   │   │   ├── 📁 hooks/                   # Custom React hooks
│   │   │   ├── 📁 utils/                   # Utility functions
│   │   │   ├── 📁 assets/                  # Images, icons, fonts
│   │   │   ├── 📄 App.tsx                  # Main App component
│   │   │   ├── 📄 main.tsx                 # React entry point
│   │   │   └── 📄 index.css                # Global styles
│   │   ├── 📁 public/                      # Static assets
│   │   ├── 📄 package.json                 # Dependencies
│   │   ├── 📄 tsconfig.json                # TypeScript config
│   │   ├── 📄 vite.config.ts               # Vite build config
│   │   ├── 📄 tailwind.config.ts           # Tailwind CSS config
│   │   ├── 📄 .env.example                 # Env template
│   │   └── 📄 README.md                    # Website documentation
│   │
│   ├── 📁 portal/                          # Secure Management Portal
│   │   ├── 📁 src/
│   │   │   ├── 📁 pages/
│   │   │   │   ├── 📄 LoginPage.tsx       # Login form
│   │   │   │   └── 📄 DashboardPage.tsx   # Dashboard
│   │   │   ├── 📁 components/              # Portal UI components
│   │   │   ├── 📁 layouts/                 # [PortalLayout.tsx]
│   │   │   ├── 📁 hooks/
│   │   │   │   └── 📄 useAuth.ts          # Authentication hook
│   │   │   ├── 📁 utils/                   # Utility functions
│   │   │   ├── 📁 assets/                  # Images, icons
│   │   │   ├── 📄 App.tsx                  # Main App component
│   │   │   ├── 📄 main.tsx                 # React entry point
│   │   │   └── 📄 index.css                # Global styles
│   │   ├── 📁 public/
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 vite.config.ts
│   │   ├── 📄 tailwind.config.ts
│   │   ├── 📄 .env.example
│   │   └── 📄 README.md
│   │
│   └── 📁 api/                             # Node.js Express API
│       ├── 📁 src/
│       │   ├── 📁 routes/
│       │   │   └── 📄 auth.ts             # Auth endpoints
│       │   ├── 📁 controllers/             # Request handlers
│       │   ├── 📁 services/                # Business logic
│       │   ├── 📁 middleware/
│       │   │   └── 📄 auth.ts             # Auth & RBAC middleware
│       │   ├── 📁 utils/
│       │   │   └── 📄 db.ts               # Database connection
│       │   ├── 📁 types/                   # TypeScript types
│       │   ├── 📄 server.ts                # Express setup
│       │   └── 📄 index.ts                 # Server entry point
│       ├── 📁 dist/                        # Compiled JavaScript
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       ├── 📄 tailwind.config.ts
│       ├── 📄 .env.example
│       └── 📄 README.md
│
├── 📁 database/                             # Database Layer
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma                # Complete data model
│   │   ├── 📁 migrations/                  # SQL migrations
│   │   └── 📁 seeds/
│   │       └── 📄 index.ts                 # Database seed script
│   ├── 📄 package.json
│   ├── 📄 .env.example
│   └── 📄 README.md
│
├── 📁 shared/                               # Shared Libraries
│   ├── 📁 design-system/
│   │   ├── 📄 theme.ts                    # Brand colors, typography
│   │   └── 📄 index.ts
│   ├── 📁 ui-components/
│   │   └── 📄 index.ts
│   ├── 📁 hooks/
│   │   └── 📄 index.ts
│   ├── 📁 utils/
│   │   ├── 📄 apiClient.ts                # Axios API client
│   │   └── 📄 index.ts
│   ├── 📁 types/
│   │   └── 📄 index.ts                    # Shared TypeScript types
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tailwind.config.ts
│   └── 📄 README.md
│
├── 📁 docs/                                 # Documentation
│   ├── 📄 PROJECT_OVERVIEW.md              # System overview
│   ├── 📄 ARCHITECTURE.md                  # Design & tech stack
│   ├── 📄 PROJECT_STRUCTURE.md             # Detailed file structure
│   ├── 📄 DATABASE_SCHEMA.md               # Data model
│   ├── 📄 IMPLEMENTATION_GUIDE.md          # Step-by-step setup
│   ├── 📄 API_DOCUMENTATION.md             # API endpoints (coming)
│   ├── 📄 DEPLOYMENT.md                    # Production deployment
│   └── 📄 TROUBLESHOOTING.md               # Common issues
│
├── 📁 scripts/                              # Build & Deployment
│   ├── 📄 build.sh                         # Production build
│   ├── 📄 deploy.sh                        # Deployment script
│   └── 📄 backup.sh                        # Database backup
│
├── 📁 .github/                              # GitHub Actions
│   └── 📁 workflows/
│       └── 📄 ci-cd.yml                    # CI/CD pipeline
│
├── 📁 node_modules/                        # Dependencies (auto-generated)
├── 📁 .vscode/                             # VS Code settings
├── 📁 .git/                                # Git repository
│
├── 📄 package.json                         # Root monorepo config
├── 📄 package-lock.json                    # Dependency lock
├── 📄 .env.example                         # Root env template
├── 📄 .gitignore                           # Git ignore rules
├── 📄 README.md                            # Main project README
├── 📄 SETUP.md                             # Detailed setup guide
└── 📄 QUICKSTART.md                        # Quick start guide
```

## Detailed Component Tree

### Website App Structure
```
apps/website/
├── src/pages/
│   ├── HomePage.tsx            ← Hero + Features + News
│   ├── AboutPage.tsx           ← School info
│   ├── AcademicsPage.tsx       ← Departments & Subjects
│   ├── AdmissionsPage.tsx      ← Admission info & form
│   ├── NewsPage.tsx            ← News articles list
│   ├── EventsPage.tsx          ← Calendar events
│   ├── GalleryPage.tsx         ← Photo gallery
│   ├── ContactPage.tsx         ← Contact form
│   └── 404Page.tsx             ← Not found
├── src/components/
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── NewsCard.tsx
│   ├── EventCard.tsx
│   └── ContactForm.tsx
├── src/layouts/
│   └── AppLayout.tsx           ← Header + Content + Footer
├── src/utils/
│   ├── seo.ts                  ← Meta tag utilities
│   ├── api.ts                  ← API calls
│   └── formatters.ts           ← Data formatting
└── src/hooks/
    └── useNewsArticles.ts      ← Data fetching
```

### Portal App Structure
```
apps/portal/
├── src/pages/
│   ├── LoginPage.tsx           ← Login form
│   ├── DashboardPage.tsx       ← Stats & overview
│   ├── StudentsPage.tsx        ← Student list
│   ├── TeachersPage.tsx        ← Teacher list
│   ├── MarksPage.tsx           ← Marks entry
│   ├── AttendancePage.tsx      ← Attendance tracking
│   ├── FinancePage.tsx         ← Fee management
│   └── SettingsPage.tsx        ← System settings
├── src/components/
│   ├── StatsCard.tsx
│   ├── StudentTable.tsx
│   ├── AttendanceForm.tsx
│   └── FinanceChart.tsx
├── src/layouts/
│   └── PortalLayout.tsx        ← Sidebar + Content
├── src/hooks/
│   ├── useAuth.ts              ← Authentication
│   ├── useStudents.ts          ← Student data
│   └── useMarks.ts             ← Mark data
└── src/utils/
    ├── api.ts                  ← API calls
    ├── validators.ts           ← Form validation
    └── formatters.ts           ← Data formatting
```

### API Backend Structure
```
apps/api/
├── src/routes/
│   ├── auth.ts                 ← /api/auth/*
│   ├── students.ts             ← /api/students/*
│   ├── teachers.ts             ← /api/teachers/*
│   ├── marks.ts                ← /api/marks/*
│   ├── attendance.ts           ← /api/attendance/*
│   └── admin.ts                ← /api/admin/*
├── src/controllers/
│   ├── auth.controller.ts
│   ├── student.controller.ts
│   └── mark.controller.ts
├── src/services/
│   ├── auth.service.ts         ← JWT, bcrypt
│   ├── student.service.ts      ← Business logic
│   └── mark.service.ts
├── src/middleware/
│   ├── auth.ts                 ← JWT verification
│   ├── rbac.ts                 ← Role checking
│   ├── errorHandler.ts         ← Error handling
│   └── validation.ts           ← Input validation
├── src/utils/
│   ├── db.ts                   ← Prisma connection
│   ├── logger.ts               ← Winston logging
│   └── validators.ts           ← Data validation
└── src/types/
    ├── user.ts
    ├── student.ts
    └── api.ts
```

### Database Structure
```
database/
├── prisma/
│   ├── schema.prisma           ← 35+ models
│   │   ├── User, Session       ← Authentication
│   │   ├── Student, Teacher    ← Core entities
│   │   ├── Class, Subject      ← Academic structure
│   │   ├── Mark, Exam          ← Assessments
│   │   ├── Attendance          ← Tracking
│   │   ├── FeeStructure        ← Finance
│   │   ├── NewsArticle         ← Public content
│   │   └── AuditLog            ← System
│   ├── migrations/
│   │   └── [timestamp]_init/    ← Auto-generated
│   │       └── migration.sql
│   └── seeds/
│       ├── index.ts            ← Main seed script
│       └── data/               ← Seed data files
└── .env.example
```

### Shared Libraries Structure
```
shared/
├── design-system/
│   ├── theme.ts                ← Colors, fonts, spacing
│   └── index.ts
├── ui-components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── index.ts
├── hooks/
│   ├── useFormData.ts
│   ├── usePagination.ts
│   └── index.ts
├── utils/
│   ├── apiClient.ts            ← Axios instance
│   ├── formatters.ts
│   ├── validators.ts
│   └── index.ts
├── types/
│   ├── user.ts
│   ├── student.ts
│   ├── api.ts
│   └── index.ts
└── package.json
```

## File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `apps/website` | ~120 | Public website |
| `apps/portal` | ~180 | Management portal |
| `apps/api` | ~200 | Backend API |
| `database` | ~50 | Database layer |
| `shared` | ~40 | Shared utilities |
| `docs` | ~10 | Documentation |
| **Total** | **~600** | Full platform |

## Key File Locations

### Configuration Files
- Root configs: `.env`, `package.json`, `tsconfig.json`
- Website: `apps/website/vite.config.ts`, `apps/website/tailwind.config.ts`
- Portal: `apps/portal/vite.config.ts`, `apps/portal/tailwind.config.ts`
- API: `apps/api/tsconfig.json`, `apps/api/.env`
- Database: `database/.env`, `database/prisma/schema.prisma`

### Entry Points
- Website: `apps/website/src/main.tsx`
- Portal: `apps/portal/src/main.tsx`
- API: `apps/api/src/index.ts`

### Main Components
- Website Layout: `apps/website/src/layouts/AppLayout.tsx`
- Portal Layout: `apps/portal/src/layouts/PortalLayout.tsx`
- Authentication: `apps/portal/src/hooks/useAuth.ts`
- API Client: `shared/utils/apiClient.ts`
- Database: `database/prisma/schema.prisma`

## Development Workflow

1. **Frontend Development**
   ```
   Make changes → Save → Vite hot reload → Browser refresh
   ```

2. **Backend Development**
   ```
   Make changes → tsx --watch → API reload
   ```

3. **Database Changes**
   ```
   Update schema.prisma → npm run db:migrate → Generate client
   ```

4. **Shared Library Changes**
   ```
   Update shared/* → npm install → Both apps use new version
   ```

## Build Output Structure

```
After "npm run build":

apps/website/dist/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── ...

apps/portal/dist/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── ...

apps/api/dist/
├── index.js
├── server.js
├── routes/
├── controllers/
├── middleware/
└── ...
```

---

**Total Size:** ~700MB (before production optimization)  
**Total Components:** ~600 files  
**Total Models:** 35+ database models  
**Total Routes:** 50+ API endpoints (to be implemented)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.
