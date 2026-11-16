import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/$/, '') : null;

const allowedOrigins = [
  clientUrl,
  clientUrl ? `https://${clientUrl.replace(/^https?:\/\//, '')}` : null,
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4000',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4000',
].filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production' ||
      (origin && origin.endsWith('.onrender.com'))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'pretwear-backend',
    phase: '6-hardening',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', path: req.path });
});

app.use(errorHandler);

export default app;
