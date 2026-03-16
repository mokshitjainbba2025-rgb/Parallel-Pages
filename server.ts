import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'db.json') 
  : path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'parallel-pages-secret-key';

// Initial Data
const initialData = {
  posts: [
    {
      id: '1',
      title: 'The Power of Parallel Thinking',
      slug: 'power-of-parallel-thinking',
      content: 'Parallel thinking is a term coined by Edward de Bono. It is a thinking process where the focus is in specific directions. When done in a group, it avoids the traditional adversarial approach of argument and debate...',
      excerpt: 'Explore how parallel thinking can transform your creative process and problem-solving abilities.',
      coverImage: 'https://picsum.photos/seed/thinking/1200/630',
      authorId: 'admin',
      authorName: 'Mokshit Jain',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Creativity', 'Thinking', 'Growth'],
      category: 'Personal Growth',
      readingTime: 5,
      seo: { title: 'The Power of Parallel Thinking', description: 'Learn about parallel thinking and its benefits.' }
    },
    {
      id: '2',
      title: 'Why Young Builders Should Document Their Journey',
      slug: 'documenting-the-journey',
      content: 'Documentation is the most underrated skill for young entrepreneurs. It creates a trail of your growth, helps others learn from your mistakes, and builds your personal brand in public...',
      excerpt: 'The importance of building in public and documenting your startup journey from day one.',
      coverImage: 'https://picsum.photos/seed/builder/1200/630',
      authorId: 'admin',
      authorName: 'Mokshit Jain',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Entrepreneurship', 'Building', 'Documentation'],
      category: 'Startups',
      readingTime: 7,
      seo: { title: 'Why Young Builders Should Document Their Journey', description: 'The value of building in public.' }
    },
    {
      id: '3',
      title: 'Lessons From a First Startup Failure',
      slug: 'lessons-startup-failure',
      content: 'Failure is not the opposite of success; it is part of it. My first startup taught me more about product-market fit, team dynamics, and cash flow than any business school ever could...',
      excerpt: 'A raw look at what went wrong with my first venture and the lessons I carried forward.',
      coverImage: 'https://picsum.photos/seed/failure/1200/630',
      authorId: 'admin',
      authorName: 'Mokshit Jain',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Startups', 'Failure', 'Lessons'],
      category: 'Entrepreneurship',
      readingTime: 8,
      seo: { title: 'Lessons From a First Startup Failure', description: 'What I learned from my first failed startup.' }
    },
    {
      id: '4',
      title: 'College Beyond Classrooms',
      slug: 'college-beyond-classrooms',
      content: 'The real value of college is not in the curriculum, but in the community. It is the only time in your life where you are surrounded by thousands of ambitious peers with nothing to lose...',
      excerpt: 'How to maximize your university years by focusing on networks, projects, and exploration.',
      coverImage: 'https://picsum.photos/seed/college/1200/630',
      authorId: 'admin',
      authorName: 'Mokshit Jain',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['College', 'Learning', 'Networking'],
      category: 'Student Life',
      readingTime: 6,
      seo: { title: 'College Beyond Classrooms', description: 'Maximizing university life.' }
    },
    {
      id: '5',
      title: 'Building Before 25',
      slug: 'building-before-25',
      content: 'There is a unique advantage to starting young. You have high energy, low opportunity cost, and a fresh perspective that incumbents often lack...',
      excerpt: 'Why your early twenties are the best time to take massive risks and build something new.',
      coverImage: 'https://picsum.photos/seed/young/1200/630',
      authorId: 'admin',
      authorName: 'Mokshit Jain',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Entrepreneurship', 'Youth', 'Building'],
      category: 'Startups',
      readingTime: 5,
      seo: { title: 'Building Before 25', description: 'Starting early in business.' }
    },
    {
      id: '6',
      title: 'Chaos, Curiosity, and Creativity',
      slug: 'chaos-curiosity-creativity',
      content: 'Creativity thrives in the space between order and chaos. By following your curiosity without a fixed destination, you often find the most innovative solutions...',
      excerpt: 'Embracing uncertainty as a catalyst for creative breakthroughs and personal discovery.',
      coverImage: 'https://picsum.photos/seed/chaos/1200/630',
      authorId: 'admin',
      authorName: 'Mokshit Jain',
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Creativity', 'Mindset', 'Curiosity'],
      category: 'Personal Growth',
      readingTime: 4,
      seo: { title: 'Chaos, Curiosity, and Creativity', description: 'The link between chaos and creativity.' }
    }
  ],
  settings: {
    siteName: 'Parallel Pages',
    siteDescription: 'A modern, editorial blogging platform for entrepreneurs, students, and creators.',
    primaryColor: '#000000',
    secondaryColor: '#f3f4f6',
    accentColor: '#2563eb',
    fontSans: 'Inter',
    fontSerif: 'Playfair Display',
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ],
    socialLinks: {
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    },
    authorName: 'Mokshit Jain',
    authorBio: 'Mokshit is a builder and storyteller focused on the intersection of technology and creativity. He documents his journey to help other young builders navigate the startup world.',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mokshit',
    themeMode: 'light'
  },
  users: [
    {
      uid: 'admin',
      email: 'admin@parallelpages.com',
      password: bcrypt.hashSync('admin123', 10),
      displayName: 'Mokshit Jain',
      role: 'admin'
    }
  ],
  subscribers: []
};

// Database Helper
function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    // On Vercel, we might need to copy the initial db from the project root to /tmp
    const templatePath = path.join(__dirname, 'db.json');
    if (fs.existsSync(templatePath)) {
      fs.writeFileSync(DB_FILE, fs.readFileSync(templatePath, 'utf-8'));
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.email === email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not logged in' });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const db = getDB();
      const user = db.users.find((u: any) => u.uid === decoded.uid);
      res.json({ user: { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Posts
  app.get('/api/posts', (req, res) => {
    const db = getDB();
    res.json(db.posts);
  });

  app.get('/api/posts/:slug', (req, res) => {
    const db = getDB();
    const post = db.posts.find((p: any) => p.slug === req.params.slug);
    if (post) res.json(post);
    else res.status(404).json({ error: 'Post not found' });
  });

  app.post('/api/posts', authenticate, (req, res) => {
    const db = getDB();
    const newPost = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.posts.push(newPost);
    saveDB(db);
    res.json(newPost);
  });

  app.put('/api/posts/:id', authenticate, (req, res) => {
    const db = getDB();
    const index = db.posts.findIndex((p: any) => p.id === req.params.id);
    if (index !== -1) {
      db.posts[index] = { ...db.posts[index], ...req.body, updatedAt: new Date().toISOString() };
      saveDB(db);
      res.json(db.posts[index]);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  });

  app.delete('/api/posts/:id', authenticate, (req, res) => {
    const db = getDB();
    db.posts = db.posts.filter((p: any) => p.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    const db = getDB();
    res.json(db.settings);
  });

  app.put('/api/settings', authenticate, (req, res) => {
    const db = getDB();
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);
    res.json(db.settings);
  });

  // Newsletter
  app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    const db = getDB();
    if (!db.subscribers.includes(email)) {
      db.subscribers.push(email);
      saveDB(db);
    }
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return app;
}

const appPromise = startServer();
export default appPromise;
