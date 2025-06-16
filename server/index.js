require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const User = require('./models/User');
const Problem = require('./models/Problem');
const { isAuthenticated } = require('./middleware/auth');
const seedProblems = require('./seed/problems');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'https://leekcode.vercel.app',
  'https://leekcode-8xuy3e17u-acs-projects-ff555b9d.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leakcode')
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed problems if the collection is empty
    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      await seedProblems();
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// JDoodle API configuration
const JD_API_URL = 'https://api.jdoodle.com/v1/execute';
const JD_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JD_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    req.session.userId = user._id;
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set user ID in session
    req.session.userId = user._id;

    // Explicitly save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Error establishing session' });
      }

      // Set cookie manually
      res.cookie('connect.sid', req.session.id, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
      });

      res.json({ message: 'Login successful' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Problem Routes
app.get('/api/problems', async (req, res) => {
  try {
    const problems = await Problem.find({}, 'title description difficulty');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/problems/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Code Submission Route
app.post('/api/submit', isAuthenticated, (req, res) => {
  const { code } = req.body;
  res.json({ code });
});

// Code execution endpoint
app.post('/api/execute', isAuthenticated, async (req, res) => {
  try {
    const { code } = req.body;
    
    const response = await axios.post(JD_API_URL, {
      clientId: JD_CLIENT_ID,
      clientSecret: JD_CLIENT_SECRET,
      script: code,
      language: 'cpp',
      versionIndex: '4' // C++ 14
    });

    res.json({
      output: response.data.output,
      statusCode: response.data.statusCode,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// Check authentication status
app.get('/api/check-auth', (req, res) => {
  console.log('Auth check:', {
    session: req.session,
    cookies: req.cookies,
    headers: req.headers
  });

  if (req.session.userId) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 