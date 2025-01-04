import React, { useState } from 'react';
import { generateRandomAvatar } from '../utils/avatarUtils';

export function UserSetup({ onSubmit }) {
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(generateRandomAvatar());
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 检查昵称长度
    if (nickname.length > 7) {
      setError('昵称长度不能超过7个字符');
      return;
    }

    if (nickname.trim()) {
      onSubmit({ nickname, avatar });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
    if (file.size > 10 * 1024 * 1024) {
      setError('头像图片大小不能超过10MB');
      e.target.value = '';
      return;
    }

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('请选择 JPG、PNG、GIF 或 WebP 格式的图片');
      e.target.value = '';
      return;
    }

    try {
      // 使用 FileReader 读取文件
      const reader = new FileReader();
      reader.onload = async (event) => {
        // 创建图片对象以检查尺寸
        const img = new Image();
        img.onload = () => {
          // 检查图片尺寸
          if (img.width > 500 || img.height > 500) {
            setError('图片尺寸不能超过 500x500 像素');
            return;
          }
          setAvatar(event.target.result);
          setError(''); // 清除错误信息
        };
        img.onerror = () => {
          setError('图片加载失败，请重试');
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        setError('读取文件失败，请重试');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('处理文件失败:', error);
      setError('处理文件失败，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          加入聊天室
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 头像选择 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 object-cover"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setAvatar(generateRandomAvatar());
                setError('');
              }}
              className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              换一个头像
            </button>
          </div>

          {/* 昵称输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError(''); // 清除错误信息
              }}
              maxLength={7}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="请输入昵称（最多7个字符）"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            进入聊天室
          </button>
        </form>
      </div>
    </div>
  );
}