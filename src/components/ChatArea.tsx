import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Chat, Message } from '../types';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

interface ChatAreaProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  onSendMessage,
}) => {
  const { register, handleSubmit, reset, setValue } = useForm<{ message: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [chat.id]);

  const onSubmit = (data: { message: string }) => {
    if (data.message.trim() === '') return;
    onSendMessage(data.message);
    reset();
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const currentValue = chatInputRef.current?.value || '';
    const selectionStart = chatInputRef.current?.selectionStart || currentValue.length;
    const selectionEnd = chatInputRef.current?.selectionEnd || currentValue.length;

    const newValue = currentValue.substring(0, selectionStart) +
                     emojiData.emoji +
                     currentValue.substring(selectionEnd);

    setValue('message', newValue, { shouldValidate: true });
    chatInputRef.current?.focus();
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.setSelectionRange(
          selectionStart + emojiData.emoji.length,
          selectionStart + emojiData.emoji.length
        );
      }
    }, 0);
  };

  return (
    <div className="flex flex-col flex-1 bg-bg-secondary">
      {/* Chat Header */}
      <div className="bg-header-bg p-4 flex items-center justify-between shadow-md">
        <h2 className="text-header-text text-xl font-semibold">{chat.name}</h2>
      </div>

      {/* Messages Display Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'me' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                msg.sender === 'me'
                  ? 'bg-chat-bubble-me-bg text-gray-800'
                  : 'bg-chat-bubble-other-bg text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs text-chat-time-text block mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t border-border-color bg-bg-primary relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="p-2 rounded-full text-text-secondary hover:bg-gray-200"
            aria-label="Toggle emoji picker"
          >
            😊
          </button>

          {/* Message Input */}
          <input
            type="text"
            {...register('message', { required: true })}
            className="flex-1 p-3 border border-border-color rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue bg-bg-secondary text-text-primary"
            placeholder="Type a message..."
            ref={chatInputRef}
          />

          {/* Send Button */}
          <button
            type="submit"
            className="bg-primary-blue text-white p-3 rounded-full hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 transform rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;