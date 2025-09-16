import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken as authenticate } from '../middleware/auth.middleware';

const router = Router();

// Storage in tmp folder for mock; in production, push to S3 or a CDN
const uploadDir = path.join(process.cwd(), 'crealith', 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.zip';
    cb(null, `digital-${unique}${ext}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['.zip', '.fig', '.ai'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Invalid file type. Allowed: ZIP, FIG, AI'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter
});

// POST /api/uploads
router.post('/', authenticate, upload.single('file'), (req, res) => {
  // Basic role check (optional): allow any authenticated for MVP
  // if (req.user?.role !== 'SELLER') return res.status(403).json({ success: false, message: 'Forbidden' });

  // In a real setup, compute a public URL (CDN/S3). For mock, serve static path.
  const filename = (req.file && req.file.filename) || '';
  if (!filename) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const url = `/files/${filename}`;
  return res.json({ success: true, data: { url, fileUrl: url, filename } });
});

export default router;


