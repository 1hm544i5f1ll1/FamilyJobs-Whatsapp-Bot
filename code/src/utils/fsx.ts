import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = 'data';

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export function readDataFile(filename: string): string {
  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) {
    return '';
  }
  return readFileSync(filePath, 'utf-8');
}

export function writeDataFile(filename: string, content: string): void {
  const filePath = join(DATA_DIR, filename);
  writeFileSync(filePath, content, 'utf-8');
}

export async function getAboutText(language: 'en' | 'ar'): Promise<string> {
  const filename = language === 'ar' ? 'about.ar.txt' : 'about.en.txt';
  const content = readDataFile(filename);
  
  if (!content) {
    // Return default about text if file doesn't exist
    return language === 'ar' 
      ? '🤖 المساعد ثنائي اللغة (واتساب ويب)\n• يجيب على الأسئلة بالعربية والإنجليزية.\n• يشرح مشاريعنا وخدماتنا.\n• متاح 24/7 بردود سريعة ومختصرة.\nأرسل سؤالك أو اكتب «المشاريع».'
      : '🤖 Bilingual Customer Assistant (WhatsApp Web)\n• Answers questions in English & Arabic.\n• Explains our projects and services.\n• 24/7 fast, concise replies.\nSend any question or type "projects".';
  }
  
  return content;
}

export function getSourceText(): string {
  return readDataFile('source.txt');
}

export function writeSourceText(content: string): void {
  writeDataFile('source.txt', content);
}

export function getEmbeddings(): any[] {
  const content = readDataFile('embeddings.json');
  if (!content) {
    return [];
  }
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export function writeEmbeddings(embeddings: any[]): void {
  writeDataFile('embeddings.json', JSON.stringify(embeddings, null, 2));
}

export function getState(): any {
  const content = readDataFile('state.json');
  if (!content) {
    return { seenChats: [] };
  }
  try {
    return JSON.parse(content);
  } catch {
    return { seenChats: [] };
  }
}

export function writeState(state: any): void {
  writeDataFile('state.json', JSON.stringify(state, null, 2));
}
