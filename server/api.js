import crypto from 'crypto';
import { getDb, hashPassword } from './db.js';

// In-memory session store: token -> user object
const sessions = new Map();

// Helper to check authentication and authorization
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const user = sessions.get(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'agency_admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

export function setupApiRoutes(app) {
  
  // --- AUTH ENDPOINTS ---

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const db = await getDb();
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user || user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const sessionUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        company_name: user.company_name,
        logo_url: user.logo_url,
        primary_color: user.primary_color
      };
      
      sessions.set(token, sessionUser);

      res.json({ token, user: sessionUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Logout
  app.post('/api/auth/logout', authenticate, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
    res.json({ success: true });
  });

  // Get current user profile
  app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ user: req.user });
  });


  // --- CLIENT MANAGEMENT (Admin only) ---

  // List clients
  app.get('/api/clients', authenticate, requireAdmin, async (req, res) => {
    try {
      const db = await getDb();
      const clients = await db.all(
        'SELECT id, email, company_name, logo_url, primary_color, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
        ['client_user']
      );
      res.json({ clients });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create client
  app.post('/api/clients', authenticate, requireAdmin, async (req, res) => {
    try {
      const { email, password, company_name, primary_color } = req.body;
      if (!email || !password || !company_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const db = await getDb();
      
      // Check if email exists
      const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const clientId = crypto.randomUUID();
      const passHash = hashPassword(password);
      
      await db.run(
        `INSERT INTO users (id, email, password_hash, role, company_name, primary_color)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [clientId, email, passHash, 'client_user', company_name, primary_color || '#3b82f6']
      );

      res.status(201).json({
        id: clientId,
        email,
        company_name,
        role: 'client_user'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete client
  app.delete('/api/clients/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const db = await getDb();
      await db.run('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'client_user']);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // --- STANDS MANAGEMENT ---

  // List stands (scoped by client role if necessary)
  app.get('/api/stands', authenticate, async (req, res) => {
    try {
      const db = await getDb();
      let stands;

      if (req.user.role === 'agency_admin') {
        stands = await db.all(`
          SELECT s.*, u.company_name as client_name 
          FROM stands s
          LEFT JOIN users u ON s.client_id = u.id
          ORDER BY s.created_at DESC
        `);
      } else {
        stands = await db.all(
          'SELECT * FROM stands WHERE client_id = ? ORDER BY created_at DESC',
          [req.user.id]
        );
      }

      res.json({ stands });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create stand (Admin only)
  app.post('/api/stands', authenticate, requireAdmin, async (req, res) => {
    try {
      const { name, type, target_url, backup_url, client_id } = req.body;
      if (!name || !type || !target_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const db = await getDb();
      const standId = crypto.randomUUID();

      // Generate a short 6-character code
      let shortCode;
      let unique = false;
      while (!unique) {
        shortCode = crypto.randomBytes(3).toString('hex'); // 6 chars
        const existing = await db.get('SELECT id FROM stands WHERE short_code = ?', [shortCode]);
        if (!existing) unique = true;
      }

      await db.run(
        `INSERT INTO stands (id, name, short_code, type, target_url, backup_url, client_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [standId, name, shortCode, type, target_url, backup_url || null, client_id || null]
      );

      const newStand = await db.get('SELECT * FROM stands WHERE id = ?', [standId]);
      res.status(201).json({ stand: newStand });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update stand
  app.put('/api/stands/:id', authenticate, async (req, res) => {
    try {
      const { name, target_url, backup_url, type, client_id } = req.body;
      const db = await getDb();

      // Fetch existing stand
      const stand = await db.get('SELECT * FROM stands WHERE id = ?', [req.params.id]);
      if (!stand) {
        return res.status(404).json({ error: 'Stand not found' });
      }

      // Clients can only update their own stand target URL
      if (req.user.role !== 'agency_admin') {
        if (stand.client_id !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        // Client can only update URL parameters
        await db.run(
          'UPDATE stands SET target_url = ?, backup_url = ? WHERE id = ?',
          [target_url || stand.target_url, backup_url || stand.backup_url, req.params.id]
        );
      } else {
        // Admin can update everything
        await db.run(
          `UPDATE stands SET name = ?, type = ?, target_url = ?, backup_url = ?, client_id = ?
           WHERE id = ?`,
          [
            name || stand.name,
            type || stand.type,
            target_url || stand.target_url,
            backup_url !== undefined ? backup_url : stand.backup_url,
            client_id !== undefined ? client_id : stand.client_id,
            req.params.id
          ]
        );
      }

      const updated = await db.get('SELECT * FROM stands WHERE id = ?', [req.params.id]);
      res.json({ stand: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete stand (Admin only)
  app.delete('/api/stands/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const db = await getDb();
      await db.run('DELETE FROM stands WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // --- ANALYTICS / METRICS ENDPOINTS ---

  app.get('/api/analytics', authenticate, async (req, res) => {
    try {
      const db = await getDb();
      
      // Determine filtering SQL based on client scope
      const isClient = req.user.role === 'client_user';
      const standFilter = isClient ? 'AND s.client_id = ?' : '';
      const filterParam = isClient ? [req.user.id] : [];

      // 1. Total Stats
      const stats = await db.get(`
        SELECT COUNT(sc.id) as total_scans,
               COUNT(DISTINCT sc.stand_id) as active_stands
        FROM scans sc
        JOIN stands s ON sc.stand_id = s.id
        WHERE 1=1 ${standFilter}
      `, filterParam);

      // Total stand count (regardless of whether they have scans)
      const standCount = await db.get(`
        SELECT COUNT(id) as count FROM stands s WHERE 1=1 ${isClient ? 'AND s.client_id = ?' : ''}
      `, filterParam);

      // 2. Scan breakdown: QR vs NFC
      const referrerStats = await db.all(`
        SELECT sc.referrer, COUNT(sc.id) as count
        FROM scans sc
        JOIN stands s ON sc.stand_id = s.id
        WHERE 1=1 ${standFilter}
        GROUP BY sc.referrer
      `, filterParam);

      // 3. Device OS breakdown
      const osStats = await db.all(`
        SELECT sc.device_os as os, COUNT(sc.id) as count
        FROM scans sc
        JOIN stands s ON sc.stand_id = s.id
        WHERE 1=1 ${standFilter}
        GROUP BY sc.device_os
        ORDER BY count DESC
        LIMIT 5
      `, filterParam);

      // 4. Geographic location breakdown (Cities)
      const locationStats = await db.all(`
        SELECT sc.city, sc.country, COUNT(sc.id) as count
        FROM scans sc
        JOIN stands s ON sc.stand_id = s.id
        WHERE 1=1 ${standFilter} AND sc.city != 'Unknown'
        GROUP BY sc.city, sc.country
        ORDER BY count DESC
        LIMIT 5
      `, filterParam);

      // 5. Timeline of scans (last 30 days)
      const timelineStats = await db.all(`
        SELECT strftime('%Y-%m-%d', sc.timestamp) as date, COUNT(sc.id) as count
        FROM scans sc
        JOIN stands s ON sc.stand_id = s.id
        WHERE 1=1 ${standFilter} AND sc.timestamp >= datetime('now', '-30 days')
        GROUP BY date
        ORDER BY date ASC
      `, filterParam);

      res.json({
        totalScans: stats.total_scans || 0,
        activeStands: stats.active_stands || 0,
        totalStands: standCount.count || 0,
        referrerStats,
        osStats,
        locationStats,
        timelineStats
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // --- PUBLIC CONFIG (No Authentication) ---
  // Retrieves stand config details for intermediate landing pages
  app.get('/api/public/stands/:shortCode', async (req, res) => {
    try {
      const { shortCode } = req.params;
      const db = await getDb();
      const stand = await db.get(
        'SELECT id, name, short_code, type, target_url, backup_url FROM stands WHERE short_code = ?',
        [shortCode]
      );
      if (!stand) {
        return res.status(404).json({ error: 'Stand not found' });
      }
      res.json({ stand });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Public endpoint to register a positive/negative review log (optional extension)
  app.post('/api/public/stands/:shortCode/feedback', async (req, res) => {
    try {
      const { shortCode } = req.params;
      const { rating, feedbackText } = req.body; // rating: 1-5
      const db = await getDb();
      
      const stand = await db.get('SELECT * FROM stands WHERE short_code = ?', [shortCode]);
      if (!stand) return res.status(404).json({ error: 'Stand not found' });

      // In a real application, you could save this to a feedback table, or email the client.
      // For this prototype, we will just print to console.
      console.log(`[FEEDBACK] Stand ${stand.name} (${shortCode}) received rating ${rating}/5. Message: ${feedbackText}`);
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
