# Academic Compass — MySQL Setup Guide

This project now uses **MySQL** as the database instead of Supabase. Follow the steps below to get everything running.

---

## 1. Prerequisites

- **Node.js** (v18 or newer)
- **MySQL** (v5.7 or v8.0+) installed and running locally
- A package manager: **npm**, **yarn**, or **bun**

---

## 2. Install MySQL (if not already installed)

### Windows
- Download MySQL Community Server from [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
- Run the installer and set a root password
- Ensure MySQL is running (check Services app or run `mysql --version` in terminal)

### macOS
```bash
brew install mysql
brew services start mysql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

---

## 3. Create the Database

1. Open a terminal and connect to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE academic_compass;
   EXIT;
   ```

---

## 4. Configure Environment Variables

Edit the `.env` file in the project root and set your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=academic_compass

JWT_SECRET=change-me-to-a-long-random-secret
PORT=3001
```

**Important:** Change `JWT_SECRET` to a long random string for security.

---

## 5. Install Dependencies

Run one of the following commands in the project directory:

```bash
npm install
# or
yarn install
# or
bun install
```

---

## 6. Start the Backend Server

In one terminal window, run:

```bash
npm run server:dev
# or
yarn server:dev
# or
bun server:dev
```

The server will start on **http://localhost:3001** and automatically create the required tables.

---

## 7. Start the Frontend

In another terminal window, run:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The Vite dev server will start on **http://localhost:8080**.

---

## 8. Sign Up

1. Open **http://localhost:8080/auth** in your browser
2. Create a new account (the first account becomes **Principal / Admin**)
3. You're ready to use the app!

---

## Troubleshooting

### "Cannot connect to MySQL"
- Ensure MySQL is running: `mysql --version` or check Services app
- Verify credentials in `.env` match your MySQL setup

### "Port 3001 already in use"
- Change `PORT=3001` to another port in `.env`
- Update Vite proxy config in `vite.config.ts` to match

### "npm ERR! bcrypt@..."
- bcrypt requires C++ build tools on Windows:
  - Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) or
  - Run `npm install --global windows-build-tools` (requires admin)

---

## Next Steps

- Configure your school settings in the app
- Add students, teachers, classes, and subjects
- Create exams and mark sheets
- Explore offline-first sync and conflict resolution features

Enjoy using Academic Compass! 🎓
