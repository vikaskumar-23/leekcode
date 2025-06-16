# LeetCode Clone

A full-stack web application that replicates core LeetCode functionality, allowing users to practice coding problems, submit solutions, and get real-time feedback.

## Features

- User Authentication (Signup/Login)
- Problem Dashboard
- Code Editor with Syntax Highlighting
- Real-time Code Execution
- Code Submission System
- Protected Routes
- Responsive Design

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- React Syntax Highlighter for code highlighting
- Bootstrap for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Express Session for authentication
- JDoodle API for code execution
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- JDoodle API credentials

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:3000
PORT=5000
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leakcode
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

## Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
leakcode/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── App.js        # Main application component
│       └── index.js      # Application entry point
│
├── server/                # Backend Node.js application
│   ├── models/           # MongoDB models
│   ├── middleware/       # Custom middleware
│   ├── seed/            # Database seeding scripts
│   └── index.js         # Server entry point
│
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/signup` - Create a new user
- POST `/api/login` - User login
- POST `/api/logout` - User logout
- GET `/api/check-auth` - Check authentication status

### Problems
- GET `/api/problems` - Get all problems
- GET `/api/problems/:id` - Get a specific problem

### Code
- POST `/api/submit` - Submit code solution
- POST `/api/execute` - Execute code