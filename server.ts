import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { initialPortfolioData } from './src/data/defaultPortfolio.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'cyber-vibin-portfolio-secret-2030';

// Ensure data and uploads directory exist
const DATA_DIR = path.resolve('data');
const UPLOADS_DIR = path.resolve('uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

// Initialize files if not existing
if (!fs.existsSync(PORTFOLIO_FILE)) {
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(initialPortfolioData, null, 2), 'utf-8');
}
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Initial admin setup: provide a pre-seeded secure admin if none exists
if (!fs.existsSync(ADMIN_FILE)) {
  const salt = crypto.randomBytes(16).toString('hex');
  // Default master password is set to 'vibin2030' or process.env.ADMIN_PASSWORD
  const initialPassword = process.env.ADMIN_PASSWORD || 'vibin2030';
  const hash = crypto.scryptSync(initialPassword, salt, 64).toString('hex');
  const adminData = {
    email: 'vibinappachi@gmail.com',
    salt,
    hash,
    initialized: true,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2), 'utf-8');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Token generation & verification
function generateToken(payload: { email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null;
    }
    return { email: parsed.email };
  } catch {
    return null;
  }
}

// Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    return;
  }
  const user = verifyToken(token);
  if (!user) {
    res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    return;
  }
  (req as any).user = user;
  next();
}

// ======================= API ROUTES =======================

// Public: Get published portfolio
app.get('/api/portfolio', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(PORTFOLIO_FILE)) {
      const data = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json(initialPortfolioData);
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read portfolio data', details: err.message });
  }
});

// Public: Contact form submission
app.post('/api/contact', (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    const inquiry = {
      id: `inq-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 100),
      subject: String(subject || 'General Inquiry').trim().slice(0, 150),
      message: String(message).trim().slice(0, 3000),
      createdAt: new Date().toISOString(),
      read: false
    };

    let inquiries: any[] = [];
    if (fs.existsSync(INQUIRIES_FILE)) {
      inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
    }
    inquiries.unshift(inquiry);
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');

    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process inquiry', details: err.message });
  }
});

// Public: Auth status
app.get('/api/auth/status', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(ADMIN_FILE)) {
      res.json({ initialized: false });
      return;
    }
    const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    res.json({ initialized: true, email: admin.email });
  } catch {
    res.json({ initialized: false });
  }
});

// Admin Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    if (!fs.existsSync(ADMIN_FILE)) {
      res.status(400).json({ error: 'Admin account has not been set up yet' });
      return;
    }

    const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    if (admin.email.toLowerCase() !== String(email).toLowerCase()) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const testHash = crypto.scryptSync(password, admin.salt, 64).toString('hex');
    if (!crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(admin.hash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ email: admin.email });
    res.json({
      success: true,
      token,
      user: { email: admin.email }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Authentication error', details: err.message });
  }
});

// Admin Setup / Password Update
app.post('/api/auth/setup', (req: Request, res: Response) => {
  try {
    const { email, password, currentPassword } = req.body;
    if (!email || !password || password.length < 6) {
      res.status(400).json({ error: 'Valid email and password (minimum 6 characters) required' });
      return;
    }

    if (fs.existsSync(ADMIN_FILE)) {
      // If admin already exists, require currentPassword or valid authorization token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const isAuthValid = Boolean(token && verifyToken(token));

      const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
      let verified: boolean = isAuthValid;

      if (!verified && currentPassword) {
        const testHash = crypto.scryptSync(currentPassword, admin.salt, 64).toString('hex');
        if (crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(admin.hash))) {
          verified = true;
        }
      }

      if (!verified) {
        res.status(403).json({ error: 'Current password or active admin session required to change credentials' });
        return;
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const newAdmin = {
      email: String(email).trim(),
      salt,
      hash,
      initialized: true,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(ADMIN_FILE, JSON.stringify(newAdmin, null, 2), 'utf-8');
    const token = generateToken({ email: newAdmin.email });

    res.json({
      success: true,
      message: 'Admin credentials configured successfully',
      token,
      user: { email: newAdmin.email }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Setup failed', details: err.message });
  }
});

// Verify Current Token (me)
app.get('/api/auth/me', requireAdmin, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ authenticated: true, user });
});

// Admin: Get draft / current portfolio
app.get('/api/admin/portfolio', requireAdmin, (_req: Request, res: Response) => {
  try {
    const data = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch portfolio', details: err.message });
  }
});

// Admin: Save / Publish portfolio changes
app.put('/api/admin/portfolio', requireAdmin, (req: Request, res: Response) => {
  try {
    const updatedData = req.body;
    if (!updatedData || !updatedData.identity || !updatedData.projects) {
      res.status(400).json({ error: 'Invalid portfolio schema' });
      return;
    }

    // Attach timestamp
    updatedData.updatedAt = new Date().toISOString();

    // Write atomically
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');
    res.json({ success: true, message: 'Portfolio updated and published successfully', data: updatedData });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save portfolio', details: err.message });
  }
});

// Admin: Upload project image
app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { filename, base64Data, contentType } = req.body;
    if (!base64Data) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    // Validate mime
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const inferredType = contentType || 'image/jpeg';
    if (!allowedTypes.includes(inferredType)) {
      res.status(400).json({ error: 'Unsupported file type. Use JPG, PNG, WEBP, or SVG' });
      return;
    }

    // Decode base64
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z+]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Max 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image exceeds 5MB limit' });
      return;
    }

    const ext = inferredType === 'image/png' ? 'png' : inferredType === 'image/webp' ? 'webp' : inferredType === 'image/svg+xml' ? 'svg' : 'jpg';
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(targetPath, buffer);
    res.json({
      success: true,
      url: `/uploads/${safeName}`,
      filename: safeName
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save uploaded image', details: err.message });
  }
});

// Admin: List inquiries
app.get('/api/admin/inquiries', requireAdmin, (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(INQUIRIES_FILE)) {
      res.json([]);
      return;
    }
    const data = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch inquiries', details: err.message });
  }
});

// Admin: Toggle inquiry read
app.put('/api/admin/inquiries/:id/read', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(INQUIRIES_FILE)) {
      res.status(404).json({ error: 'No inquiries' });
      return;
    }
    const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
    const item = inquiries.find((i: any) => i.id === id);
    if (!item) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    item.read = !item.read;
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update inquiry', details: err.message });
  }
});

// Admin: Delete inquiry
app.delete('/api/admin/inquiries/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(INQUIRIES_FILE)) {
      res.status(404).json({ error: 'No inquiries' });
      return;
    }
    let inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
    inquiries = inquiries.filter((i: any) => i.id !== id);
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inquiry', details: err.message });
  }
});

// ======================= FRONTEND SERVING =======================
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Cyberpunk Portfolio Server] Running on http://localhost:${PORT}`);
    console.log(`[Cyberpunk Portfolio Server] Mode: ${IS_PROD ? 'Production' : 'Development'}`);
  });
}

startServer();
