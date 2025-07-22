// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL, 
      'http://localhost:3000',
      'http://localhost:5001',
      'null' // For file:// protocol
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes - Note the /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// API Documentation Route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API!',
    documentation: {
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register a new user',
          example: 'http://localhost:' + PORT + '/api/auth/register'
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login a user',
          example: 'http://localhost:' + PORT + '/api/auth/login'
        },
        {
          method: 'POST',
          path: '/api/auth/forgot-password',
          description: 'Request password reset',
          example: 'http://localhost:' + PORT + '/api/auth/forgot-password'
        },
        {
          method: 'GET/PUT',
          path: '/api/profile',
          description: 'Get or update user profile',
          example: 'http://localhost:' + PORT + '/api/profile'
        }
      ],
      base_url_local: 'http://localhost:' + PORT + '/api',
      base_url_deploy: 'https://your-deployment-url/api'
    }
  });
});

// Frontend catch-all route (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('MongoDB connection string not configured');
    }

    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend available at: http://localhost:${PORT}/`);
      console.log(`📚 API documentation available at: http://localhost:${PORT}/api`);
      
      // Auto-open browser in development
      if (process.env.NODE_ENV === 'development') {
        import('open').then(open => {
          open.default(`http://localhost:${PORT}`)
            .catch(e => console.log('Browser open error:', e));
        });
      }
    });

    return server;
  } catch (err) {
    console.error('💥 Server startup failed:', err);
    process.exit(1);
  }
};

// Initialize server
let server;
startServer().then(s => server = s);