'use client';

import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotificationToast({ message, type, id, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose(id);
      }
    }, 5000); // Notification disappears after 5 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icon = {
    success: <CheckCircle className="text-green-500" />,
    error: <XCircle className="text-red-500" />,
    info: <Info className="text-blue-500" />,
    warning: <AlertTriangle className="text-yellow-500" />,
  }[type];

  const bgColor = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
    warning: 'bg-yellow-100',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  }[type];

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 transform transition-transform duration-300 ease-out ${bgColor} ${textColor}`}
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      {icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
        <XCircle size={18} />
      </button>
    </div>
  );
}
