import React from 'react';
import type { Message } from '../types';
import { themeClasses } from '../utils/themeClasses';
import { MdDoneAll, MdDone } from 'react-icons/md';

interface MessageComponentProps {
  message: Message;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  const isOutgoing = message.sender === 'me';
  const messageClasses = isOutgoing
    ? `${themeClasses.messageOut} self-end`
    : `${themeClasses.messageIn} self-start`;

  return (
    <div className={`flex flex-col max-w-[70%] ${isOutgoing ? 'items-end' : 'items-start'}`}>
      <div className={`${messageClasses} p-3`}>
        {message.type === 'text' && <p>{message.content}</p>}
        {message.type === 'image' && (
          <img src={message.content} alt="Sent" className="max-w-xs rounded-lg" />
        )}
        {message.type === 'file' && (
            <a href={message.content} target="_blank" rel="noopener noreferrer" className="text-primary-blue underline">
                Download File
            </a>
        )}
        <div className={`text-xs mt-1 ${isOutgoing ? 'text-gray-200' : 'text-text-secondary'} flex items-center justify-end`}>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isOutgoing && (
            <span className="ml-1">
              {message.status === 'read' ? <MdDoneAll className="text-blue-300" size={16} /> : <MdDone size={16} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;