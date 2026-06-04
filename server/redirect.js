import useragent from 'useragent';
import geoip from 'geoip-lite';
import crypto from 'crypto';
import { getDb } from './db.js';

export async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;
    const db = await getDb();

    // 1. Find the stand in the database
    const stand = await db.get('SELECT * FROM stands WHERE short_code = ?', [shortCode]);
    if (!stand) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Tag Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0f172a; color: #f8fafc; text-align: center; }
              .card { padding: 2rem; border-radius: 12px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              h1 { color: #f43f5e; margin-top: 0; }
              p { color: #94a3b8; font-size: 1.1rem; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>404</h1>
              <p>This NFC / QR code stand has not been configured yet or the link is invalid.</p>
            </div>
          </body>
        </html>
      `);
    }

    // 2. Parse User-Agent
    const uaString = req.headers['user-agent'] || '';
    const agent = useragent.parse(uaString);
    const deviceOs = agent.os.toString().split(' ')[0] || 'Unknown'; // e.g. iOS, Android, Windows
    const browser = agent.toAgent().split(' ')[0] || 'Unknown'; // e.g. Chrome, Mobile Safari

    // Determine device type
    let deviceType = 'Desktop';
    if (/mobile/i.test(uaString)) {
      deviceType = 'Mobile';
    } else if (/tablet|ipad/i.test(uaString)) {
      deviceType = 'Tablet';
    }

    // 3. Parse GeoIP Location
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    
    // Normalize localhost IPs for testing
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('::ffff:127.0.0.1')) {
      // Use a test IP for demo/local testing if needed, or defaults
      clientIp = '8.8.8.8'; // Google DNS IP (forces US, California)
    }

    const geo = geoip.lookup(clientIp);
    const country = geo ? geo.country : 'Unknown';
    const city = geo ? geo.city : 'Unknown';

    // 4. Determine Referrer (NFC tap vs QR scan via query param)
    // If the printed QR/NFC URL is: https://agency.com/r/xyz?src=nfc
    const referrer = req.query.src === 'nfc' ? 'NFC' : 'QR';

    // 5. Save scan details asynchronously
    const scanId = crypto.randomUUID();
    db.run(
      `INSERT INTO scans (id, stand_id, device_os, device_type, browser, country, city, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [scanId, stand.id, deviceOs, deviceType, browser, country, city, referrer]
    ).catch(err => console.error('Failed to log scan:', err));

    // 6. Direct user based on Stand Type
    // Note: React dashboard runs on port 5173 (dev) or same port in production.
    // If it's a review filter or wifi stand, we redirect to the React frontend UI.
    const host = req.headers.host || 'localhost:5000';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    
    if (stand.type === 'review_filter') {
      // Redirect to the frontend review handler landing page
      // In development, React is on port 5173. We'll redirect to it.
      const clientUrl = host.includes('localhost') 
        ? 'http://localhost:5173' 
        : `${protocol}://${host}`;
      return res.redirect(`${clientUrl}/feedback/${shortCode}`);
    } else if (stand.type === 'wifi') {
      const clientUrl = host.includes('localhost') 
        ? 'http://localhost:5173' 
        : `${protocol}://${host}`;
      return res.redirect(`${clientUrl}/wifi/${shortCode}`);
    } else {
      // Standard HTTP 302 Redirect
      let target = stand.target_url;
      // Ensure target URL has protocol
      if (!/^https?:\/\//i.test(target)) {
        target = `https://${target}`;
      }
      return res.redirect(target);
    }
  } catch (error) {
    console.error('Redirect handler error:', error);
    return res.status(500).send('Internal Server Error');
  }
}
