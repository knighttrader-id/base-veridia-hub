const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API endpoint to upload file and generate hash
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Read file and generate hash
  const filePath = req.file.path;
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // Clean up uploaded file (in production, store in IPFS)
  fs.unlinkSync(filePath);

  res.json({
    hash: '0x' + hash,
    filename: req.file.originalname,
    size: req.file.size
  });
});

// API endpoint to record copyright (mock, in real would interact with blockchain)
app.post('/api/record-copyright', (req, res) => {
  const { hash, title, description } = req.body;

  // Here would call smart contract
  // For now, mock response

  res.json({
    success: true,
    transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
    workId: hash
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});