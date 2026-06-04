import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleRedirect } from './redirect.js';
import { setupApiRoutes } from './api.js';
import { getDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend calls
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Initialize Database connection on startup
getDb().then(() => {
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// 1. Dynamic Redirect Route (High Performance)
app.get('/r/:shortCode', handleRedirect);

// 2. REST API Routes
setupApiRoutes(app);

// 3. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Redirections active at http://localhost:${PORT}/r/:shortCode`);
});
