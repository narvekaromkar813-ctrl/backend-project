import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../api/axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('offline'); // 'live' | 'connecting' | 'offline'
  const [latestGeneration, setLatestGeneration] = useState(null);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect only when user is authenticated
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setStatus('offline');
      }
      return;
    }

    setStatus('connecting');
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('live');
      const userId = user.id || user._id;
      if (userId) {
        newSocket.emit('join-user', userId);
      }
    });

    newSocket.on('disconnect', () => {
      setStatus('offline');
    });

    newSocket.on('connect_error', () => {
      setStatus('offline');
    });

    // Event 1: alert:new -> toast + increment unread count + refresh alerts queries
    newSocket.on('alert:new', (payload) => {
      try {
        const title = payload?.title || 'System Alert';
        const message = payload?.message || payload?.description || 'A solar telemetry issue was detected.';
        const severity = payload?.severity || 'medium';

        setUnreadAlertCount((prev) => prev + 1);

        toast((t) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-semibold text-sm">
              <span className="capitalize text-amber-500">⚠️ {severity} Alert: {title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        ), {
          duration: 6000,
          position: 'top-right'
        });

        // Invalidate React Query caches for alerts and dashboard
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } catch (err) {
        console.error('Error handling alert:new socket event:', err);
      }
    });

    // Event 2: generation:update -> live-update dashboard power output card/chart
    newSocket.on('generation:update', (payload) => {
      try {
        if (payload) {
          setLatestGeneration(payload);
          queryClient.invalidateQueries({ queryKey: ['generation'] });
        }
      } catch (err) {
        console.error('Error handling generation:update socket event:', err);
      }
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setStatus('offline');
    };
  }, [isAuthenticated, user, queryClient]);

  const resetUnreadCount = (count = 0) => {
    setUnreadAlertCount(count);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        status, // 'live' | 'connecting' | 'offline'
        isLive: status === 'live',
        latestGeneration,
        unreadAlertCount,
        setUnreadAlertCount,
        resetUnreadCount
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
