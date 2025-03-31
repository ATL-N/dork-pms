'use client'
import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, Sun, Moon, User } from "lucide-react";

const Header = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Low feed stock alert for Pen 1", read: false },
    { id: 2, message: "Production target reached for today", read: false },
    { id: 3, message: "Temperature warning in Pen 2", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showDropdown) setShowDropdown(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="fixed w-full bg-card shadow-md z-50 h-header">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-secondary mr-2"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold text-primary">PoultryPro</h1>
          </Link>
        </div>

        <div className="flex items-center">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-secondary mr-2"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-secondary mr-2 relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="flex justify-between items-center p-3 border-b border-border">
                  <h3 className="font-medium">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-border hover:bg-secondary ${
                          !notification.read
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          2 hours ago
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-muted-foreground">
                      No notifications
                    </p>
                  )}
                </div>
                <div className="p-2 text-center border-t border-border">
                  <Link
                    href="/notifications"
                    className="text-sm text-primary hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-secondary"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User size={18} />
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="py-2 px-4 border-b border-border">
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">Farm Manager</p>
                </div>
                <ul>
                  <li>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-secondary"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 hover:bg-secondary"
                    >
                      Settings
                    </Link>
                  </li>
                  <li className="border-t border-border">
                    <Link
                      href="/logout"
                      className="block px-4 py-2 hover:bg-secondary text-danger"
                    >
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
