# Drumvale Secondary School - Enterprise Platform

A complete enterprise school management platform with a public website and secure portal.

## Project Structure Overview

```
school-platform/
├── apps/                          # Applications monorepo
│   ├── website/                   # Public school website (SEO optimized)
│   │   ├── src/
│   │   │   ├── pages/            # Website pages
│   │   │   ├── components/       # Reusable components
│   │   │   ├── layouts/          # Layout components
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── assets/           # Images, icons, fonts
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── public/               # Static files
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── .env.example
│   │   └── README.md
│   │
│   ├── portal/                    # Secure management portal (authenticated)
│   │   ├── src/
│   │   │   ├── pages/            # Portal pages (Dashboard, Students, etc)
│   │   │   ├── components/       # Portal components
│   │   │   ├── layouts/          # Portal layout with sidebar
│   │   │   ├── hooks/            # Auth hooks, API hooks
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── assets/           # Images, icons
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── api/                       # Node.js Express API backend
│       ├── src/
│       │   ├── routes/           # API endpoints
│       │   ├── controllers/      # Request handlers
│       │   ├── services/         # Business logic
│       │   ├── middleware/       # Auth, RBAC, error handling
│       │   ├── utils/            # Database, logger, validators
│       │   ├── types/            # TypeScript types
│       │   ├── server.ts         # Express app setup
│       │   └── index.ts          # Server entry point
│       ├── dist/                 # Compiled JavaScript
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       └── README.md
│
├── database/                      # Database schema & migrations
│   ├── prisma/
│   │   ├── schema.prisma         # Complete Prisma schema
│   │   ├── migrations/           # SQL migrations
│   │   └── seeds/
│   │       └── index.ts          # Database seed script
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── shared/                        # Shared libraries & design system
│   ├── design-system/            # Brand colors, typography, spacing
│   ├── ui-components/            # Shared React components
│   ├── hooks/                    # Shared custom hooks
│   ├── utils/                    # Shared utilities (API client, formatters)
│   ├── types/                    # Shared TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── README.md
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # System design & technology stack
│   ├── PROJECT_STRUCTURE.md      # Detailed directory structure
│   ├── DATABASE_SCHEMA.md        # Database design
│   ├── IMPLEMENTATION_GUIDE.md   # Step-by-step setup
│   ├── API_DOCUMENTATION.md      # API endpoints
│   ├── DEPLOYMENT.md             # Production deployment
│   └── TROUBLESHOOTING.md        # Common issues
│
├── scripts/                       # Build & deployment scripts
│   ├── build.sh                  # Production build
│   ├── deploy.sh                 # Deployment script
│   └── backup.sh                 # Database backup
│
├── .github/                       # GitHub Actions CI/CD
│   └── workflows/
│       └── ci-cd.yml             # Automated testing & deployment
│
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── package.json                   # Root monorepo config
├── README.md                      # This file
├── SETUP.md                       # Setup instructions
└── QUICKSTART.md                  # Quick start guide
```

## System Overview

### **System 1: Public Website** (apps/website)
- Accessible to everyone
- SEO optimized
- Pages: Home, About, Academics, Admissions, News, Events, Gallery, Contact
- Responsive design
- Social sharing previews
- Structured data for search engines

### **System 2: Secure Portal** (apps/portal)
- Requires authentication
- Role-Based Access Control (RBAC)
- Pages: Dashboard, Students, Teachers, Marks, Attendance, Finance, Settings
- Protected with JWT tokens
- Blocked from search engines (noindex, nofollow)
- Internal operations only

### **API Backend** (apps/api)
- RESTful API
- JWT authentication
- RBAC middleware
- Rate limiting & security headers
- Comprehensive error handling
- Audit logging

### **Database** (database)
- MySQL 8.0
- Prisma ORM
- 35+ data models
- Automatic migrations
- Seed scripts

### **Shared Libraries** (shared)
- Design system (colors, typography, spacing)
- Type definitions
- API client
- Common utilities
- Reusable components

## Technology Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 8.1** - Build tool
- **Tailwind CSS 3.4** - Styling
- **React Router 6.30** - Routing
- **Axios** - HTTP client
- **React Query** - Data fetching
- **Zustand** - State management

### Backend
- **Node.js 18+** - Runtime
- **Express 4.19** - Web framework
- **TypeScript 5.8** - Type safety
- **Prisma 5.0** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - Logging

### Database
- **MySQL 8.0** - Relational database
- **Prisma** - Query builder & ORM

### DevOps
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **Let's Encrypt** - SSL certificates
- **Docker** (optional) - Containerization

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MySQL 8.0+
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd school-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/website/.env.example apps/website/.env
   cp apps/portal/.env.example apps/portal/.env
   cp database/.env.example database/.env
   ```

4. **Configure database**
   ```bash
   mysql -u root -p
   CREATE DATABASE school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'school_app'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON school_db.* TO 'school_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development**
   ```bash
   npm run dev
   ```

   Applications will be available at:
   - Website: http://localhost:3000
   - Portal: http://localhost:3001
   - API: http://localhost:5000

## Development Commands

```bash
# Development
npm run dev              # Start all apps in dev mode
npm run dev:website     # Start website only
npm run dev:portal      # Start portal only
npm run dev:api         # Start API only

# Building
npm run build           # Build all apps
npm run build:website   # Build website only
npm run build:portal    # Build portal only
npm run build:api       # Build API only

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed initial data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Quality
npm run lint            # Lint all apps
npm run test            # Run tests
```

## Project Features

✅ **Authentication & Authorization**
- Secure JWT-based authentication
- Role-Based Access Control (RBAC)
- Session management
- Optional MFA for admins

✅ **Public Website**
- SEO optimized (meta tags, sitemap, robots.txt)
- Social sharing previews
- Responsive design
- Content management
- News & events
- Contact forms with CAPTCHA

✅ **Management Portal**
- Student management
- Teacher management
- Marks & attendance tracking
- Financial management
- Timetable management
- Library management
- Audit logging
- User management

✅ **Security**
- HTTPS/TLS encryption
- CORS protection
- Rate limiting
- Input validation
- XSS protection
- SQL injection prevention
- CSRF tokens

✅ **Scalability**
- Monorepo structure for code sharing
- Horizontal scaling with PM2
- Database indexing
- API caching
- CDN ready

✅ **DevOps**
- GitHub Actions CI/CD
- Automated testing
- Docker support
- VPN remote access
- Backup & recovery

## Documentation

- [Architecture & Design](./docs/ARCHITECTURE.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Implementation Guide](./docs/IMPLEMENTATION_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user

### Student Management
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Additional endpoints documented in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is proprietary software of Drumvale Secondary School.

## Support

For issues and questions, contact the development team at tech@school.sch.ke

---

**Version:** 1.0.0  
**Last Updated:** 2024-07-09  
**Status:** 🚀 Production Ready
