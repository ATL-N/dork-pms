import { useState, useRef, useEffect } from 'react';
import { Bell, Moon, Sun, User, ChevronDown, Menu, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useFarm } from '@/app/context/FarmContext';

export default function Header({ toggleSidebar, toggleDarkMode, darkMode, session }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentFarm } = useFarm();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="h-16 bg-[color:var(--card)] border-b border-[color:var(--border)] flex items-center px-6 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-[color:var(--muted)] md:hidden"
        >
          <Menu size={20} className="text-[color:var(--foreground)]" />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-[color:var(--muted)]">
          <Bell size={20} className="text-[color:var(--foreground)]" />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-[color:var(--muted)]"
        >
          {darkMode ? (
            <Sun size={20} className="text-[color:var(--foreground)]" />
          ) : (
            <Moon size={20} className="text-[color:var(--foreground)]" />
          )}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white">
              <User size={16} />
            </div>
            {session?.user?.name && <span>{session.user.name}</span>}
            <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <div
            className={`absolute right-0 mt-2 w-48 bg-[color:var(--card)] border border-[color:var(--border)] shadow-lg rounded-md z-10 overflow-hidden transition-all duration-300 ease-in-out ${
              dropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 hover:bg-[color:var(--muted)]"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} className="mr-2" />
                My Profile
              </Link>
              <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 hover:bg-[color:var(--muted)]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-[color:var(--muted)]"
                onClick={() => signOut()}
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
