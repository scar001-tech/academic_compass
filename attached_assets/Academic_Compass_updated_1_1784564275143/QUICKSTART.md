# 🚀 Quick Start — Drumvale School Platform

Complete enterprise school management platform with public website and secure portal.

---

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
# Create MySQL database
mysql -u root -p
```

```sql
CREATE DATABASE school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'school_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON school_db.* TO 'school_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Configure Environment
```bash
copy .env.example .env
copy apps\api\.env.example apps\api\.env
copy apps\website\.env.example apps\website\.env
copy apps\portal\.env.example apps\portal\.env
copy database\.env.example database\.env
```

Edit `database\.env`:
```
DATABASE_URL="mysql://school_app:secure_password@localhost:3306/school_db"
```

Edit `apps\api\.env`:
```
DATABASE_URL="mysql://school_app:secure_password@localhost:3306/school_db"
JWT_SECRET="change-this-to-a-random-secret"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

### Step 4: Initialize Database
```bash
npm run db:migrate
npm run db:seed
```

### Step 5: Start Development
```bash
npm run dev
```

---

## 🌐 Access Applications

| Application | URL | Purpose |
|---|---|---|
| **Public Website** | http://localhost:3000 | Public school information, news, admissions |
| **Management Portal** | http://localhost:3001 | Secure admin dashboard, student/teacher management |
| **API Backend** | http://localhost:5000 | REST API serving both apps |

---

## 📦 Project Structure

```
school-platform/
├── apps/website/          ← Public website (SEO optimized)
├── apps/portal/           ← Secure portal (authentication required)
├── apps/api/              ← Express.js API backend
├── database/              ← Prisma schema & migrations
├── shared/                ← Design system & utilities
└── docs/                  ← Complete documentation
```

---

## 🎯 Key Commands

```bash
# Development
npm run dev              # Start all apps
npm run dev:website     # Website only
npm run dev:portal      # Portal only
npm run dev:api         # API only

# Production Build
npm run build           # Build all
npm run build:website   # Website build
npm run build:portal    # Portal build
npm run build:api       # API build

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Quality Assurance
npm run lint            # Lint all code
npm run test            # Run tests
```

---

## ✨ What's Included

### ✅ Public Website (apps/website)
- SEO optimized pages
- Social sharing previews
- Responsive design
- News & events sections
- Contact forms
- Hero sections

### ✅ Management Portal (apps/portal)
- Secure login with JWT
- Dashboard with analytics
- Student management
- Teacher management
- Marks & attendance
- Financial tracking
- Role-based access control

### ✅ API Backend (apps/api)
- RESTful endpoints
- JWT authentication
- RBAC middleware
- Rate limiting
- Security headers
- Comprehensive logging

### ✅ Database (database)
- 35+ data models
- Automatic migrations
- Performance indexes
- Relationship constraints
- Seed data scripts

---

## 🔐 Security Features

- ✅ HTTPS/TLS encryption ready
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Rate limiting on API
- ✅ Helmet security headers
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ Audit logging

---

## 🧪 Test Login

Portal requires authentication. After seeding, test with:

```bash
# API health check
curl http://localhost:5000/health

# Login (credentials from seed)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.sch.ke","password":"password"}'
```

---

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)** — Complete system overview
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Technical design & tech stack
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** — Detailed file structure
- **[DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)** — Data model design
- **[IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md)** — Phase-by-phase setup
- **[SETUP.md](../SETUP.md)** — Detailed installation guide

---

## 🚀 Next Steps

1. **Customize Branding**
   - Update `shared/design-system/theme.ts`
   - Add logo to `apps/website/public/`
   - Update school name & colors

2. **Create More Pages**
   - Add pages in `apps/website/src/pages/`
   - Build portal features in `apps/portal/src/pages/`
   - Implement API routes in `apps/api/src/routes/`

3. **Setup Production**
   - Follow [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
   - Configure Nginx reverse proxy
   - Setup SSL with Let's Encrypt
   - Enable PM2 process management

4. **Integrate Services**
   - Email notifications
   - SMS gateway
   - Payment processing
   - Ministry integration

---

## ⚠️ Common Issues

### Port Already in Use
```bash
# Windows: Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"
```

### Module Not Found
```bash
rmdir /s node_modules
npm install
```

---

## 🤝 Support

- 📖 Read documentation in `docs/` folder
- 🐛 Check error messages in console
- 💬 Review code comments for context
- 📞 Contact: tech@school.sch.ke

---

**Happy building! 🎉**

Next: Read [SETUP.md](../SETUP.md) for detailed installation or [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design.
