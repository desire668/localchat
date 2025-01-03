import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { UserSetup } from './components/UserSetup';
import { ChatRoom } from './components/ChatRoom';
import { generateRandomAvatar } from './utils/avatarUtils';

// 将 socket 移到组件外部，确保只创建一次连接
const socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default function App() {
  const [isSetup, setIsSetup] = useState(() => {
    return localStorage.getItem('chatUserInfo') !== null;
  });
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('chatUserInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // 如果有保存的用户信息，自动重新连接
    if (currentUser) {
      socket.emit('setUserInfo', currentUser);
    }

    function handleMessage(message) {
      setMessages(prev => [...prev, message]);
    }

    function handleUserList(userList) {
      setUsers(userList);
    }

    function handleUserJoined(user) {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${user.nickname} 加入了聊天室`,
        timestamp: new Date().toISOString()
      }]);
    }

    function handleUserLeft(user) {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${user.nickname} 离开了聊天室`,
        timestamp: new Date().toISOString()
      }]);
    }

    // 注册事件监听
    socket.on('message', handleMessage);
    socket.on('userList', handleUserList);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);

    // 清理函数
    return () => {
      socket.off('message', handleMessage);
      socket.off('userList', handleUserList);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
    };
  }, [currentUser]);

  const handleUserSetup = (userInfo) => {
    const user = {
      ...userInfo,
      avatar: userInfo.avatar || generateRandomAvatar()
    };
    localStorage.setItem('chatUserInfo', JSON.stringify(user));
    setCurrentUser(user);
    socket.emit('setUserInfo', user);
    setIsSetup(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatUserInfo');
    setCurrentUser(null);
    setIsSetup(false);
    socket.disconnect();
    socket.connect();
  };

  return (
    <div className="h-screen bg-gray-100">
      {!isSetup ? (
        <UserSetup onSubmit={handleUserSetup} />
      ) : (
        <ChatRoom
          messages={messages}
          users={users}
          currentUser={currentUser}
          socket={socket}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}