import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'; 
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import type { Chat, Message } from './types';
import { v4 as uuidv4 } from 'uuid';


const AI_API_URL = import.meta.env.VITE_REACT_APP_AI_API_ENDPOINT;
const AI_API_KEY = import.meta.env.VITE_REACT_APP_AI_API_KEY;

const App: React.FC = () => {
  
  const navigate = useNavigate(); 

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});

  
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedMessages = localStorage.getItem('messages'); 

    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
    if (savedMessages) {
      
      setMessages(JSON.parse(savedMessages));
    }

    
    if (savedChats) {
      const parsedChats: Chat[] = JSON.parse(savedChats);
      if (parsedChats.length > 0 && window.location.pathname === '/') {
        navigate(`/chat/${parsedChats[0].id}`);
      }
    }
  }, [navigate]); 

  
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  
  const addMessage = useCallback((chatId: string, newMessage: Omit<Message, 'id' | 'timestamp'>) => {
    const messageToAdd: Message = {
      ...newMessage,
      id: uuidv4(),
      timestamp: Date.now(),
      status: 'sent', 
    };

    setMessages(prevMessages => ({
      ...prevMessages,
      [chatId]: [...(prevMessages[chatId] || []), messageToAdd],
    }));

    
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, lastMessage: messageToAdd, unreadCount: chat.unreadCount + (newMessage.sender === 'me' ? 0 : 1) }
          : chat
      )
    );

    
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.type === 'ai' && newMessage.sender === 'me') {
      const fullPrompt = `${chat.aiPrompt ? chat.aiPrompt + "\n\n" : ""}User: ${newMessage.content}\nAI:`;
      integrateAIResponse(chatId, fullPrompt);
    }
  }, [chats]); 

  
  const integrateAIResponse = useCallback(async (chatId: string, promptForAI: string) => {
    if (!AI_API_URL || !AI_API_KEY) {
      console.error("Hugging Face API URL or Key is not set in environment variables.");
      addMessage(chatId, { sender: 'ai', type: 'text', content: 'AI service not configured.', chatId });
      return;
    }

    
    setChats(prevChats =>
      prevChats.map(chat => (chat.id === chatId ? { ...chat, isTyping: true } : chat))
    );

    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: promptForAI,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            do_sample: true,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Hugging Face API request failed: ${response.status} ${response.statusText}`;
        try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
                errorMessage = `Hugging Face API Error: ${errorData.error}`;
            } else if (errorData.detail) {
                errorMessage = `Hugging Face API Error: ${errorData.detail}`;
            }
        } catch (jsonError) {
            errorMessage = `Hugging Face API Error: ${errorText}`;
        }
        console.error("Hugging Face API Error Response:", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      let aiResponseContent = data[0]?.generated_text || "Sorry, I couldn't generate a response from Hugging Face.";

      let cleanAiResponse = aiResponseContent.replace(promptForAI, '').trim();
      if (!cleanAiResponse) {
          cleanAiResponse = "Sorry, I couldn't generate a meaningful response.";
      }

      await new Promise(resolve => setTimeout(resolve, Math.min(cleanAiResponse.length * 30, 2000)));

      const aiMessage: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'ai',
        type: 'text',
        content: cleanAiResponse,
        chatId,
      };
      addMessage(chatId, aiMessage);

    } catch (error: any) {
      console.error("Error fetching AI response from Hugging Face:", error);
      addMessage(chatId, { sender: 'ai', type: 'text', content: `AI Error: ${error.message || 'Could not connect to Hugging Face service.'}`, chatId });
    } finally {
      setChats(prevChats =>
        prevChats.map(chat => (chat.id === chatId ? { ...chat, isTyping: false } : chat))
      );
    }
  }, [addMessage, AI_API_URL, AI_API_KEY]); 

  return (
    <Layout>
      <Sidebar chats={chats} setChats={setChats} navigate={navigate} />
      <Routes> {/* Routes must be inside BrowserRouter */}
        <Route path="/chat/:chatId" element={<ChatWrapper messages={messages} addMessage={addMessage} chats={chats} setChats={setChats} />} />
        <Route path="/" element={<div className="flex-1 flex items-center justify-center text-text-secondary text-lg">Select a chat to start messaging or create a new one!</div>} />
      </Routes>
    </Layout>
  );
};



const ChatWrapper: React.FC<{
    messages: { [chatId: string]: Message[] };
    addMessage: (chatId: string, newMessage: Omit<Message, 'id' | 'timestamp'>) => void;
    chats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}> = ({ messages, addMessage, chats, setChats }) => {
  const { chatId } = useParams<{ chatId: string }>();
  const currentChat = chats.find(chat => chat.id === chatId);
  const currentMessages = chatId ? messages[chatId] || [] : [];

  
  useEffect(() => {
    if (chatId && currentChat && currentChat.unreadCount > 0) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [chatId, currentChat, setChats]);

  if (!currentChat) {
    return <div className="flex-1 flex items-center justify-center text-text-secondary text-lg">Chat not found or selected.</div>;
  }

  return (
    <ChatArea
      chat={currentChat}
      messages={currentMessages}
      onSendMessage={(content) => addMessage(currentChat.id, { sender: 'me', type: 'text', content, chatId: currentChat.id })}
    />
  );
};

export default App;