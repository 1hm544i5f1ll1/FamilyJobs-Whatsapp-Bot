import express from 'express';
import auth from 'basic-auth';
import { logger } from '../utils/logger';
import { getClient } from '../wa/client';
import { getSourceText, writeSourceText, getAboutText } from '../utils/fsx';
import { generateEmbeddings } from '../rag/embed';
import { chunkText } from '../rag/chunk';

const router = express.Router();

// Basic authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const credentials = auth(req);
  
  if (!credentials || 
      credentials.name !== process.env['ADMIN_USER'] || 
      credentials.pass !== process.env['ADMIN_PASS']) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  return next();
};

// Apply authentication to all admin routes
router.use(authenticate);

// Get system status
router.get('/status', (_req, res) => {
  const client = getClient();
  const isReady = client ? true : false;
  
  res.json({
    status: 'ok',
    whatsapp: {
      ready: isReady,
      connected: isReady
    },
    timestamp: new Date().toISOString()
  });
});

// Get current source text
router.get('/source', (_req, res) => {
  try {
    const sourceText = getSourceText();
    res.json({ content: sourceText });
  } catch (error) {
    logger.error('Error getting source text:', error);
    res.status(500).json({ error: 'Failed to get source text' });
  }
});

// Update source text and regenerate embeddings
router.post('/source', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Write source text
    writeSourceText(content);
    
    // Generate chunks and embeddings
    const chunks = chunkText(content);
    const embeddings = await generateEmbeddings(chunks);
    
    // Store embeddings (in a real implementation, you'd store these in a database)
    logger.info(`Generated ${embeddings.length} embeddings for ${chunks.length} chunks`);
    
    return res.json({ 
      success: true, 
      chunks: chunks.length,
      embeddings: embeddings.length 
    });
  } catch (error) {
    logger.error('Error updating source text:', error);
    return res.status(500).json({ error: 'Failed to update source text' });
  }
});

// Get about text
router.get('/about/:language', async (req, res) => {
  try {
    const { language } = req.params;
    if (!['en', 'ar'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Use "en" or "ar"' });
    }
    
    const aboutText = await getAboutText(language as 'en' | 'ar');
    return res.json({ content: aboutText });
  } catch (error) {
    logger.error('Error getting about text:', error);
    return res.status(500).json({ error: 'Failed to get about text' });
  }
});

// Update about text
router.post('/about/:language', (req, res) => {
  try {
    const { language } = req.params;
    const { content } = req.body;
    
    if (!['en', 'ar'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Use "en" or "ar"' });
    }
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Write about text to file
    const { writeDataFile } = require('../utils/fsx');
    const filename = language === 'ar' ? 'about.ar.txt' : 'about.en.txt';
    writeDataFile(filename, content);
    
    return res.json({ success: true });
  } catch (error) {
    logger.error('Error updating about text:', error);
    return res.status(500).json({ error: 'Failed to update about text' });
  }
});

// Send test message
router.post('/test-message', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }
    
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: 'WhatsApp client not ready' });
    }
    
    const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    await client.sendMessage(chatId, message);
    
    return res.json({ success: true });
  } catch (error) {
    logger.error('Error sending test message:', error);
    return res.status(500).json({ error: 'Failed to send test message' });
  }
});

export { router as adminRouter };
