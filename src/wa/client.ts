import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { logger } from '../utils/logger';
import { detectLanguage } from '../lang/detect';
import { searchSimilarChunks } from '../rag/search';
import { getAboutText } from '../utils/fsx';
import { updateSeenChats, isChatSeen } from '../utils/state';

let client: Client;

export async function initWhatsAppClient(): Promise<void> {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    logger.info('QR Code received. Scan with WhatsApp mobile app:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    logger.info('WhatsApp client is ready!');
  });

  client.on('authenticated', () => {
    logger.info('WhatsApp client authenticated');
  });

  client.on('auth_failure', (msg) => {
    logger.error('Authentication failed:', msg);
  });

  client.on('disconnected', (reason) => {
    logger.warn('WhatsApp client disconnected:', reason);
  });

  client.on('message', async (message: Message) => {
    try {
      await handleMessage(message);
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  });

  await client.initialize();
}

async function handleMessage(message: Message): Promise<void> {
  // Skip messages from groups and status
  if (message.from.includes('@g.us') || message.from.includes('status')) {
    return;
  }

  const chatId = message.from;
  const messageText = message.body.toLowerCase().trim();

  // Check if this is a first contact
  if (!isChatSeen(chatId)) {
    const language = detectLanguage(message.body);
    const aboutText = await getAboutText(language);
    
    await sendMessage(message, aboutText);
    updateSeenChats(chatId);
    return;
  }

  // Handle commands
  if (messageText === 'about' || messageText === 'عن') {
    const language = detectLanguage(message.body);
    const aboutText = await getAboutText(language);
    await sendMessage(message, aboutText);
    return;
  }

  if (messageText === 'projects' || messageText === 'services' || 
      messageText === 'المشاريع' || messageText === 'الخدمات') {
    const language = detectLanguage(message.body);
    const aboutText = await getAboutText(language);
    await sendMessage(message, aboutText);
    return;
  }

  // RAG-based response
  try {
    const language = detectLanguage(message.body);
    const response = await searchSimilarChunks(message.body, language);
    await sendMessage(message, response);
  } catch (error) {
    logger.error('Error generating RAG response:', error);
    const language = detectLanguage(message.body);
    const fallbackMessage = language === 'ar' 
      ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
      : 'Sorry, an error occurred. Please try again.';
    await sendMessage(message, fallbackMessage);
  }
}

async function sendMessage(message: Message, text: string): Promise<void> {
  try {
    // Split long messages (>4096 chars)
    if (text.length > 4096) {
      const chunks = splitMessage(text);
      for (const chunk of chunks) {
        await message.reply(chunk);
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      await message.reply(text);
    }
  } catch (error) {
    logger.error('Error sending message:', error);
  }
}

function splitMessage(text: string, maxLength: number = 4096): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  const sentences = text.split(/[.!?]\s+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length + 2 <= maxLength) {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
        currentChunk = sentence;
      } else {
        // Single sentence is too long, force split
        chunks.push(sentence.substring(0, maxLength));
        currentChunk = sentence.substring(maxLength);
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

export function getClient(): Client {
  return client;
}
