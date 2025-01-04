import React from 'react';

export function UserList({ users, currentUser }) {
  const decodeNickname = (nickname) => {
    try {
      return decodeURIComponent(nickname);
    } catch (e) {
      return nickname;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2 text-sm text-gray-400">在线用户 ({users.length})</div>
      <div className="space-y-1">
        {users.map((user, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-700/30 ${
              user.nickname === currentUser?.nickname ? 'bg-gray-700/20' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-gray-600 overflow-hidden">
              <img
                src={user.avatar}
                alt={decodeNickname(user.nickname)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nickname || 'fallback'}`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">
                {decodeNickname(user.nickname)}
                {user.nickname === currentUser?.nickname && (
                  <span className="ml-2 text-xs text-gray-400">(我)</span>
                )}
              </div>
              <div className="text-xs text-green-400">在线</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}