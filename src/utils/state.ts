import { readFileSync, writeFileSync, existsSync } from 'fs';
import { logger } from './logger';

const STATE_FILE = 'data/state.json';

interface AppState {
  seenChats: string[];
  lastUpdated: string;
}

let state: AppState = {
  seenChats: [],
  lastUpdated: new Date().toISOString()
};

// Load state from file on startup
function loadState(): void {
  try {
    if (existsSync(STATE_FILE)) {
      const data = readFileSync(STATE_FILE, 'utf-8');
      state = { ...state, ...JSON.parse(data) };
      logger.info(`Loaded state with ${state.seenChats.length} seen chats`);
    }
  } catch (error) {
    logger.error('Error loading state:', error);
  }
}

// Save state to file
function saveState(): void {
  try {
    state.lastUpdated = new Date().toISOString();
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Error saving state:', error);
  }
}

// Initialize state on module load
loadState();

/**
 * Check if a chat has been seen before
 */
export function isChatSeen(chatId: string): boolean {
  return state.seenChats.includes(chatId);
}

/**
 * Mark a chat as seen
 */
export function updateSeenChats(chatId: string): void {
  if (!state.seenChats.includes(chatId)) {
    state.seenChats.push(chatId);
    saveState();
    logger.info(`Marked chat ${chatId} as seen`);
  }
}

/**
 * Get all seen chats
 */
export function getSeenChats(): string[] {
  return [...state.seenChats];
}

/**
 * Clear all seen chats
 */
export function clearSeenChats(): void {
  state.seenChats = [];
  saveState();
  logger.info('Cleared all seen chats');
}

/**
 * Get state statistics
 */
export function getStateStats(): { seenChats: number; lastUpdated: string } {
  return {
    seenChats: state.seenChats.length,
    lastUpdated: state.lastUpdated
  };
}
