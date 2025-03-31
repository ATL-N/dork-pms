'use client'
import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
// import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
//   const router = useRouter();

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Check for saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close sidebar on route change on mobile
//   useEffect(() => {
//     const handleRouteChange = () => {
//       if (window.innerWidth < 768) {
//         setSidebarOpen(false);
//       }
//     };

//     router.events.on("routeChangeComplete", handleRouteChange);

//     return () => {
//       router.events.off("routeChangeComplete", handleRouteChange);
//     };
//   }, [router]);

  return (
    <div className={`layout-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Header
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Sidebar open={sidebarOpen} />
      <div className="page-container">
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
