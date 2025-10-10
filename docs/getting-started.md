# 🚀 Getting Started

Complete setup guide for HR-Admin-Hamere-Birhan Full-Stack application.

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **MySQL** 8.0+ database
- **Git** for version control

## 🛠️ Installation & Setup

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/robson120-s/HR-Admin-Hamere-Birhan-Full-Stack.git
cd HR-Admin-Hamere-Birhan-Full-Stack

Step 2: Backend Setup
bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
Configure your .env file:

env
DATABASE_URL="mysql://username:password@localhost:3306/hr_database"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5555
Database Setup:

bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed initial data (if available)
npx prisma db seed
Step 3: Frontend Setup
bash
cd client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
Frontend environment:

env
REACT_APP_API_URL=http://localhost:5555/api
🎯 Running the Application
Start Backend Server
bash
cd server
npm run dev
# Server runs on http://localhost:5555
Start Frontend Application
bash
cd client  
npm start
# Application runs on http://localhost:3000
✅ Verification
Backend Health Check: Visit http://localhost:5555/api/health

Frontend Application: Browser opens to http://localhost:3000

🐛 Common Issues
MySQL Connection Issues:

Ensure MySQL service is running

Verify database credentials in .env

Check if database exists

Port Conflicts:

bash
# Kill processes using ports 3000 or 5555
npx kill-port 3000
npx kill-port 5555
<div align="center">
🎉 Your HR Admin Panel is now running!

</div> ```