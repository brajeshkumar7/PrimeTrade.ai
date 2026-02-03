# PrimeTrade - Quick Start Guide

## 🚀 Get Running in 30 Seconds

### Prerequisites
- Docker & Docker Compose installed

### Start Everything

```bash
docker-compose up --build
```

Then visit: **http://localhost:3000**

---

## 🐳 Docker Commands

### Start Application
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Rebuild without cache
docker-compose up --build --no-cache
```

### Stop Application
```bash
# Stop running containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (volumes, networks)
docker-compose down -v

# Force stop without graceful shutdown
docker-compose kill
```

### View Logs
```bash
# All services logs
docker-compose logs

# Backend logs only
docker-compose logs backend

# Frontend logs only
docker-compose logs frontend

# MongoDB logs only
docker-compose logs mongo

# Follow logs in real-time
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend

# Last 50 lines
docker logs primetrade-backend --tail 50

# Filter for errors
docker-compose logs | grep -i error
```

### Health Check
```bash
# Check running containers
docker-compose ps

# Detailed status
docker compose ps --all

# Health check specific service
curl http://localhost:5000/api/v1/health
```

### Database Commands
```bash
# Access MongoDB from Docker container
docker exec -it primetrade-mongo mongosh

# View users in database
db.users.find()

# View tasks in database
db.tasks.find()

# Clear all data
db.users.deleteMany({})
db.tasks.deleteMany({})
exit
```

---

## 📝 For Manual Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally or in Docker
- npm

### Step 1: Start MongoDB
```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  --name primetrade-mongo \
  mongo:6.0
```

### Step 2: Start Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```

Frontend opens at **http://localhost:3000**

---

## 🧪 Testing the API

### Using Postman

1. Import `PrimeTrade_API.postman_collection.json` into Postman
2. Create environment variable: `base_url=http://localhost:5000/api/v1`
3. Run requests in order:
   - Register → saves JWT token
   - Create Task → saves task ID
   - Update/Delete Task
   - Logout

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"test123"}'

# Login (save the token)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Create Task (replace TOKEN)
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Description"}'
```

### Complete Testing Guide

For comprehensive testing of all features, see **README.md** Testing Guide section which includes:
- Step-by-step tests for every feature (12 test cases)
- Multiple testing methods (Frontend UI, Postman, cURL)
- Permission and security tests
- Complete workflow examples
- Bash script for automated testing
- Database verification steps

---

## 🎯 Application Features

### Register & Login
- Go to http://localhost:3000/register
- Create account with name, email, password
- Automatically logged in with JWT
- Token stored in localStorage

### Dashboard
- Create tasks with title and description
- View all your tasks
- Edit task title, description, status
- Mark tasks as pending/completed
- Delete tasks

### Admin Features

You can create and manage admin users in two ways:

#### Option 1: Create Admin User Directly
```bash
curl -X POST http://localhost:5000/api/v1/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

#### Option 2: Promote Existing User to Admin
```bash
# 1. First login as an admin and get their token
# 2. Get the user ID you want to promote from /users/all endpoint
# 3. Update their role:

curl -X PATCH http://localhost:5000/api/v1/users/{USER_ID}/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -d '{"role": "admin"}'
```

#### Option 3: Update via MongoDB (Direct Database Access)
```bash
docker exec -it primetrade-mongo mongosh

use primetrade
db.users.updateOne(
  { email: "your-email@test.com" },
  { $set: { role: "admin" } }
)
exit
```

**Important**: After updating role, user must log out and log back in to get new token with updated privileges.

### Admin Capabilities

Once a user is promoted to admin, they can:
- View all tasks from all users (`GET /api/v1/tasks/all`)
- View all users (`GET /api/v1/users/all`)
- Manage user roles (`PATCH /api/v1/users/:userId/role`)
- See "All Tasks" tab in the Dashboard UI

For detailed admin management guide, see the **Admin Setup & Role Management** section in **README.md**

---

## 🔧 Common Docker Tasks

### View Backend Logs
```bash
docker-compose logs -f backend
```

### View Frontend Logs
```bash
docker-compose logs -f frontend
```

### Stop Docker Services
```bash
docker-compose down
```

### Reset Database
```bash
# Remove all containers and volumes
docker-compose down -v

# Start fresh
docker-compose up --build
```

### Rebuild Specific Service
```bash
# Rebuild only backend
docker-compose up --build backend

# Rebuild only frontend
docker-compose up --build frontend
```

### Execute Commands in Container
```bash
# Run MongoDB command
docker exec primetrade-mongo mongosh < commands.js

# Run Node command in backend
docker exec primetrade-backend node -e "console.log('Hello')"
```

---

## 🆘 Troubleshooting

### Services Won't Start

```
Error: bind: address already in use
```

**Solution**: Kill process using the port
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID {PID} /F
```

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED
```

**Solution**: Reset Docker completely
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Frontend Can't Connect to Backend

```
CORS error or connection refused
```

**Solution**: Verify backend is running
```bash
curl http://localhost:5000/api/v1/health
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```

**Solution**: Kill process on port 3000
```bash
netstat -ano | findstr :3000
taskkill /PID {PID} /F
```

### Token Expired Error
→ Normal behavior, login again to get new token

### Email Already Exists
→ Use different email or reset database with `docker-compose down -v`

---

## 📊 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:5000/api/v1 | API endpoints |
| Health Check | http://localhost:5000/api/v1/health | API availability |
| MongoDB | localhost:27017 | Database (internal) |

---

## 📋 Quick API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Get JWT token |
| POST | /auth/logout | Yes | Revoke token |
| GET | /auth/me | Yes | Current user |
| POST | /tasks | Yes | Create task |
| GET | /tasks | Yes | Your tasks |
| GET | /tasks/all | Admin | All tasks |
| PATCH | /tasks/:id | Yes | Update task |
| DELETE | /tasks/:id | Yes | Delete task |

---

## 📚 Documentation

- **README.md** - Complete documentation including:
  - Architecture and design
  - Setup instructions
  - API documentation
  - Testing guide (12 test cases)
  - Admin setup & role management
  - Security implementation
  - Deployment strategies
- **QUICKSTART.md** - This quick start guide
- **PrimeTrade_API.postman_collection.json** - Postman API testing collection

---

## ✅ Verification Checklist

- [ ] Docker & Docker Compose installed
- [ ] `docker-compose up --build` runs without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Can create a task
- [ ] Can update task status
- [ ] Can delete a task
- [ ] Logout works correctly
- [ ] Postman collection works

---

## 🎉 Ready to Go!

Your PrimeTrade application is now running. Visit http://localhost:3000 and start using the application!

For detailed information, see **README.md**.

**Happy developing!** 🚀
