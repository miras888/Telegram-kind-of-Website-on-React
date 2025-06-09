

export interface Message {
  id: string;
  chatId: string;
  sender: 'me' | 'other' | 'ai';
  type: 'text' | 'image' | 'file';
  content: string; 
  timestamp: number; 
  status?: 'sent' | 'delivered' | 'read';
}

export type ChatType = 'person' | 'ai';

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  avatarUrl?: string; 
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean; 
  isTyping?: boolean; 
  aiPrompt?: string; 
}