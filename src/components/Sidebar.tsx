
import React, { useState, useCallback, useMemo } from 'react';
import type { Chat, ChatType } from '../types';
import { themeClasses } from '../utils/themeClasses';
import { MdSearch, MdMessage, MdPersonAdd, MdComputer, MdClose } from 'react-icons/md'; 
import { v4 as uuidv4 } from 'uuid';
import ChatListItem from './ChatListItem';

interface SidebarProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  navigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, setChats, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const filteredChats = useMemo(() => {
    return chats.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)); 
  }, [chats, searchTerm]);

  const handleCreateNewChat = useCallback((type: ChatType) => {
  let newChatName = prompt(`Enter name for new ${type === 'person' ? 'person' : 'AI bot'} chat:`);
  if (!newChatName) return; 

  
  let aiPrompt: string | null | undefined = undefined; 
  if (type === 'ai') {
      aiPrompt = prompt(`Enter initial prompt/personality for the AI bot (optional, e.g., "You are a helpful assistant."):`);
      if (aiPrompt === null) aiPrompt = undefined; 
  }

  const newChat: Chat = {
      id: uuidv4(),
      name: newChatName,
      type: type,
      unreadCount: 0,
      isOnline: type === 'person' ? true : undefined,
      isTyping: type === 'ai' ? false : undefined,
      aiPrompt: aiPrompt 
  };
  setChats(prev => [newChat, ...prev]);
  navigate(`/chat/${newChat.id}`);
  setShowNewChatModal(false);
}, [setChats, navigate]);

  return (
    <div className={themeClasses.sidebar}>
      {/* Header for Sidebar */}
      <div className="p-4 border-b border-border-color flex items-center justify-between">
        <h2 className="text-xl font-semibold">Telegram Clone</h2>
        <div className="flex space-x-2">
          {}
          <button className="p-2 rounded-full hover:bg-bg-secondary"><MdMessage size={24} /></button>
          <button className="p-2 rounded-full hover:bg-bg-secondary" onClick={() => setShowNewChatModal(true)}><MdPersonAdd size={24} /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border-color">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 && <p className="text-center text-text-secondary p-4">No chats found.</p>}
        {filteredChats.map(chat => (
          <ChatListItem key={chat.id} chat={chat} navigate={navigate} />
        ))}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowNewChatModal(false)}
            >
              <MdClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Create New Chat</h3>
            <div className="space-y-4">
              <button
                className="w-full bg-primary-blue text-white py-2 px-4 rounded-md hover:bg-dark-blue flex items-center justify-center"
                onClick={() => handleCreateNewChat('person')}
              >
                <MdPersonAdd className="mr-2" /> New Person Chat
              </button>
              <button
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
                onClick={() => handleCreateNewChat('ai')}
              >
                <MdComputer className="mr-2" /> New AI Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;