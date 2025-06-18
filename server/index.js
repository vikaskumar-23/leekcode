require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Problem = require('./models/Problem');
const seedProblems = require('./seed/problems');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Seed problems if the collection is empty
    return Problem.countDocuments();
  })
  .then(count => {
    if (count === 0) {
      return seedProblems();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// JDoodle API configuration
const JD_API_URL = 'https://api.jdoodle.com/v1/execute';
const JD_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JD_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

// JWT Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'User created successfully', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  res.json({ message: 'Logged out successfully' });
});

// Problem Routes
app.get('/api/problems', async (req, res) => {
  try {
    const problems = await Problem.find({}, 'title description');
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
app.post('/api/submit', authMiddleware, (req, res) => {
  const { code } = req.body;
  res.json({ code });
});

// Code execution endpoint
app.post('/api/execute', authMiddleware, async (req, res) => {
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
app.get('/api/check-auth', authMiddleware, (req, res) => {
  res.json({ authenticated: true, userId: req.user.userId });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 