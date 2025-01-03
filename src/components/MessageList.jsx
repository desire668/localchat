import React, { useEffect, useRef } from 'react';

export function MessageList({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
      {messages.map((message, index) => {
        if (message.type === 'system') {
          return (
            <div key={index} className="flex justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                {message.content}
              </span>
            </div>
          );
        }

        const isCurrentUser = message.user?.nickname === currentUser?.nickname;

        return (
          <div
            key={index}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%] group`}>
              <img
                src={message.user?.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-gray-200 dark:border-gray-700"
              />
              <div className={`mx-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {message.user?.nickname}
                </div>
                <div className={`p-3 rounded-2xl ${
                  isCurrentUser 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}>
                  {message.type === 'file' ? (
                    <a
                      href={message.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {message.fileName}
                    </a>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isCurrentUser ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}