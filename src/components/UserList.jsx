import React from 'react';

export function UserList({ users, currentUser }) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-800 dark:bg-gray-900">
      <div className="px-4 py-3 text-sm text-gray-400 border-y border-gray-700/50">
        在线用户 ({users.length})
      </div>
      {users.map((user, index) => (
        <div 
          key={index} 
          className={`flex items-center gap-3 p-4 hover:bg-gray-700/30 transition-colors cursor-pointer ${
            user.nickname === currentUser?.nickname 
              ? 'bg-gray-700/50' 
              : ''
          }`}
        >
          <img
            src={user.avatar}
            alt={user.nickname}
            className="w-10 h-10 rounded-full border-2 border-gray-600"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {user.nickname}
              {user.nickname === currentUser?.nickname && (
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                  我
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">在线</div>
          </div>
        </div>
      ))}
    </div>
  );
}