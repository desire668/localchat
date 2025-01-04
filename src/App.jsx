import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { UserSetup } from './components/UserSetup';
import { ChatRoom } from './components/ChatRoom';

// Socket.IO 客户端配置
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  withCredentials: false,
  autoConnect: true,
  forceNew: true
});

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 连接事件处理
    socket.on('connect', () => {
      console.log('已连接到服务器');
      setConnected(true);
      
      // 如果有用户信息，重新发送
      if (currentUser) {
        socket.emit('setUserInfo', currentUser);
      }
    });

    // 断开连接事件处理
    socket.on('disconnect', () => {
      console.log('与服务器断开连接');
      setConnected(false);
    });

    // 连接确认
    socket.on('connected', (data) => {
      console.log('连接已确认:', data);
    });

    // 心跳检测响应
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // 用户列表更新
    socket.on('userList', (userList) => {
      console.log('用户列表更新:', userList);
      setUsers(userList);
    });

    // 消息处理
    socket.on('message', (message) => {
      console.log('收到消息:', message);
      setMessages(prev => [...prev, message]);
    });

    // 错误处理
    socket.on('error', (error) => {
      console.error('Socket错误:', error);
    });

    // 连接错误处理
    socket.on('connect_error', (error) => {
      console.error('连接错误:', error);
    });

    // 清理函数
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connected');
      socket.off('ping');
      socket.off('userList');
      socket.off('message');
      socket.off('error');
      socket.off('connect_error');
    };
  }, [currentUser]);

  const handleUserSetup = (userInfo) => {
    console.log('设置用户信息:', userInfo);
    setCurrentUser(userInfo);
    
    if (connected) {
      socket.emit('setUserInfo', userInfo);
    }
  };

  const handleLogout = () => {
    console.log('用户登出');
    socket.disconnect();
    setCurrentUser(null);
    setUsers([]);
    setMessages([]);
    setConnected(false);
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900">
      {!currentUser ? (
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