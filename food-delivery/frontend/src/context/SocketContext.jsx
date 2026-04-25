import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Connect to socket server
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);

      // Register user with their userId
      newSocket.emit('join', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on logout or unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, user]);

  // Join a specific order room
  const joinOrderRoom = (orderId) => {
    if (socket) {
      socket.emit('joinOrderRoom', orderId);
      console.log('Joined order room:', orderId);
    }
  };

  // Leave a specific order room
  const leaveOrderRoom = (orderId) => {
    if (socket) {
      socket.emit('leaveOrderRoom', orderId);
      console.log('Left order room:', orderId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrderRoom,
        leaveOrderRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};