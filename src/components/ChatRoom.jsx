import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { UserList } from './UserList';
import { ThemeToggle } from './ThemeToggle';
import { FileManager } from './FileManager';

export function ChatRoom({ messages, users, currentUser, socket, onLogout }) {
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiContainerRef = useRef(null);

  useEffect(() => {
    // 创建 emoji 选择器
    const createEmojiPicker = () => {
      const picker = document.createElement('emoji-picker');
      picker.addEventListener('emoji-click', event => {
        setNewMessage(prev => prev + event.detail.unicode);
        setShowEmoji(false);
      });
      return picker;
    };

    // 处理 emoji 选择器的显示和隐藏
    if (showEmoji) {
      const container = emojiContainerRef.current;
      if (container) {
        if (!emojiPickerRef.current) {
          emojiPickerRef.current = createEmojiPicker();
        }
        container.innerHTML = '';
        container.appendChild(emojiPickerRef.current);
      }
    }
  }, [showEmoji]);

  // 点击其他地方关闭emoji选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmoji && 
          !event.target.closest('.emoji-picker-container') && 
          event.target !== emojiButtonRef.current) {
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmoji]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (emojiPickerRef.current) {
        emojiPickerRef.current.remove();
        emojiPickerRef.current = null;
      }
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('message', {
        type: 'text',
        content: newMessage
      });
      setNewMessage('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      socket.emit('message', {
        type: 'file',
        content: data.url,
        fileName: data.originalName
      });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* 左侧个人信息和用户列表 */}
      <div className="w-[280px] flex flex-col bg-gray-800 dark:bg-gray-900 text-white">
        {/* 个人信息 */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.nickname}
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
            <div className="flex-1">
              <div className="font-medium">{currentUser?.nickname}</div>
              <div className="text-xs text-gray-400">在线</div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索"
              className="w-full bg-gray-700/50 text-white placeholder-gray-400 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 用户列表 */}
        <UserList users={users} currentUser={currentUser} />
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* 聊天区域标题 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">聊天室</h2>
          <button
            onClick={() => setShowFileManager(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>群文件</span>
          </button>
        </div>

        {/* 消息列表 */}
        <MessageList messages={messages} currentUser={currentUser} />

        {/* 输入区域 */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isUploading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <div className="relative">
              <button
                type="button"
                ref={emojiButtonRef}
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {showEmoji && (
                <div 
                  ref={emojiContainerRef}
                  className="absolute bottom-full right-0 mb-2 emoji-picker-container z-50 shadow-xl rounded-lg overflow-hidden"
                />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="输入消息..."
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* 文件管理器 */}
      <FileManager
        isOpen={showFileManager}
        onClose={() => setShowFileManager(false)}
      />
    </div>
  );
}