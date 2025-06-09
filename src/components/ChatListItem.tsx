import React from 'react';
import type { Chat } from '../types';
import { useLocation } from 'react-router-dom';
import { MdComputer } from 'react-icons/md';

interface ChatListItemProps {
  chat: Chat;
  navigate: (path: string) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, navigate }) => {
  const location = useLocation();
  const isActive = location.pathname === `/chat/${chat.id}`;

  return (
    <div
      className={`flex items-center p-3 cursor-pointer hover:bg-bg-secondary transition-colors ${isActive ? 'bg-bg-secondary' : ''}`}
      onClick={() => navigate(`/chat/${chat.id}`)}
    >
      {/* Avatar / Icon */}
      <div className="relative w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-semibold mr-3">
        {chat.avatarUrl ? (
          <img src={chat.avatarUrl} alt={chat.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          chat.name.charAt(0).toUpperCase()
        )}
        {chat.type === 'person' && chat.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
        {chat.type === 'ai' && <MdComputer className="absolute bottom-0 right-0 text-primary-blue" size={16} />} {/* AI indicator */}
      </div>

      {/* Chat Info */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg truncate">{chat.name}</span>
          {chat.lastMessage && (
            <span className="text-sm text-text-secondary ml-2">
              {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        {chat.lastMessage && (
          <p className="text-sm text-text-secondary truncate">
            {chat.lastMessage.content}
          </p>
        )}
        {chat.isTyping && chat.type === 'ai' && (
          <p className="text-sm text-primary-blue italic">AI is typing...</p>
        )}
      </div>

      {/* Unread Count */}
      {chat.unreadCount > 0 && (
        <span className="ml-2 bg-primary-blue text-white text-xs font-bold px-2 py-1 rounded-full">
          {chat.unreadCount}
        </span>
      )}
    </div>
  );
};

export default ChatListItem;