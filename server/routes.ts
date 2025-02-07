import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./chat";
import multer from "multer";
import { storage } from "./storage";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // In a real app, we'd upload to S3/etc. For demo, we'll use base64
    const base64 = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    res.json({ imageUrl });
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}
