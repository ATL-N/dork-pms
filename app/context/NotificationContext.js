'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NotificationToast from '../components/NotificationToast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = uuidv4();
    const newNotification = { id, message, type, duration };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[1000]">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
