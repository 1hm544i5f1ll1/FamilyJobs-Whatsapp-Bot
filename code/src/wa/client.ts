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
    
    // Store QR code for web display
    global.qrCode = qr;
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

  // Skip messages sent by the bot itself
  if (message.fromMe) {
    return;
  }

  const chatId = message.from;
  const messageText = message.body.toLowerCase().trim();
  
  logger.info(`Received message from ${chatId}: ${message.body.substring(0, 50)}...`);

  // Check if this is a first contact
  if (!isChatSeen(chatId)) {
    logger.info(`First contact from ${chatId}, sending welcome message`);
    const language = detectLanguage(message.body);
    const aboutText = await getAboutText(language);
    
    await sendMessage(message, aboutText);
    updateSeenChats(chatId);
    return;
  }

  // Handle commands
  if (messageText === 'about' || messageText === 'عن' || messageText === 'من نحن') {
    logger.info(`Command detected: about`);
    const language = detectLanguage(message.body);
    const aboutText = await getAboutText(language);
    await sendMessage(message, aboutText);
    return;
  }

  if (messageText === 'projects' || messageText === 'services' || 
      messageText === 'المشاريع' || messageText === 'الخدمات') {
    logger.info(`Command detected: projects/services`);
    const language = detectLanguage(message.body);
    const aboutText = await getAboutText(language);
    await sendMessage(message, aboutText);
    return;
  }

  // Handle help commands
  if (messageText === 'help' || messageText === 'مساعدة' || messageText === 'مساعده') {
    logger.info(`Command detected: help`);
    const language = detectLanguage(message.body);
    const helpText = language === 'ar'
      ? `مرحباً! أنا مساعدك في عائلة الوظائف مصر.

الأوامر المتاحة:
• "about" أو "عن" - معلومات عن الشركة
• "projects" أو "المشاريع" - خدماتنا
• "help" أو "مساعدة" - هذه الرسالة

يمكنك أيضاً طرح أي سؤال وسأحاول مساعدتك!`
      : `Hello! I'm your assistant at Family Jobs Egypt.

Available commands:
• "about" - Company information
• "projects" or "services" - Our services
• "help" - This message

You can also ask any question and I'll try to help!`;
    await sendMessage(message, helpText);
    return;
  }

  // RAG-based response
  try {
    logger.info(`Processing RAG query: ${message.body.substring(0, 50)}...`);
    const language = detectLanguage(message.body);
    const response = await searchSimilarChunks(message.body, language);
    logger.info(`RAG response generated (${response.length} chars)`);
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
    if (!text || text.trim().length === 0) {
      logger.warn('Attempted to send empty message');
      return;
    }
    
    logger.info(`Sending message to ${message.from} (${text.length} chars)`);
    
    // Split long messages (>4096 chars)
    if (text.length > 4096) {
      const chunks = splitMessage(text);
      logger.info(`Splitting message into ${chunks.length} chunks`);
      for (const chunk of chunks) {
        await message.reply(chunk);
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      await message.reply(text);
    }
    logger.info('Message sent successfully');
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error; // Re-throw to see the error in the caller
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
