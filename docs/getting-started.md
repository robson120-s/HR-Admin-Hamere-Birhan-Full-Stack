# Getting Started

This guide will walk you through setting up the project on your local machine for development and testing.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Git

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/robson120-s/HR-Admin-Hamere-Birhan-Full-Stack.git
    cd HR-Admin-Hamere-Birhan-Full-Stack
    ```

2.  **Set up the Backend:**
    Navigate to the server directory and install dependencies.
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and copy the contents of `.env.example`. Update the `DATABASE_URL` with your PostgreSQL connection string.

3.  **Run Database Migrations:**
    This command will set up your database schema.
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Set up the Frontend:**
    In a new terminal, navigate to the client directory and install dependencies.
    ```bash
    cd client
    npm install
    ```

## Running the Application

You need two terminals open to run both the frontend and backend simultaneously.

1.  **Start the Backend Server:**
    In your first terminal (in the `/server` directory):
    ```bash
    npm run dev
    ```
    The server should now be running on `http://localhost:8000`.

2.  **Start the Frontend Application:**
    In your second terminal (in the `/client` directory):
    ```bash
    npm start
    ```
    The React application should now be running and will open in your browser at `http://localhost:3000`.