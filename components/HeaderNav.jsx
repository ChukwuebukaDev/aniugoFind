import { useState, useRef, useEffect } from "react";
import extraPointBarToggler from "../hooks/helperHook";
import ClearAllPointsButton from "../appBtnHandlers/ClearAllPoints";

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { showBar, toggleShowbar } = extraPointBarToggler();
  const settingsRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
    if (tab !== "settings") setSettingsOpen(false);
    if (tab === "routes") console.log("Routes clicked");
    if (tab === "saved") console.log("Saved clicked");
  };

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "routes", label: "Routes", icon: "🗺️" },
    { id: "saved", label: "Saved", icon: "⭐" },
  ];

  return (
    <>
      {/* Desktop Navigation - Solid background */}
      <div className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-md border border-gray-200/50 dark:border-gray-700/50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`
              relative px-5 py-2 rounded-full text-sm font-medium
              transition-all duration-300 ease-out
              flex items-center gap-2
              ${
                activeTab === item.id
                  ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 shadow-sm"
                  : "text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => {
              setActiveTab("settings");
              setSettingsOpen((prev) => !prev);
            }}
            className={`
              relative px-5 py-2 rounded-full text-sm font-medium
              transition-all duration-300 ease-out
              flex items-center gap-2
              ${
                activeTab === "settings" || settingsOpen
                  ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
                  : "text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
          >
            <span className="text-base">⚙️</span>
            <span>Settings</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`
                w-4 h-4 transition-transform duration-300
                ${settingsOpen ? "rotate-180" : "rotate-0"}
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {settingsOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-56 py-2 z-[1050] animate-fadeInUp border border-gray-200 dark:border-gray-700">
              <button className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-3 text-sm">
                <span className="text-lg">🌓</span>
                <span className="text-gray-700 dark:text-gray-200">
                  Toggle Theme
                </span>
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-3 text-sm">
                <span className="text-lg">🗺️</span>
                <span className="text-gray-700 dark:text-gray-200">
                  Map Style
                </span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center gap-3 text-sm">
                <span className="text-lg">🗑️</span>
                <span className="text-red-600 dark:text-red-400">
                  Clear Saved Data
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md border border-gray-200/50 dark:border-gray-700/50"
          aria-label="Menu"
        >
          <div className="relative w-5 h-5">
            <span
              className={`
              absolute h-0.5 w-5 bg-gray-700 dark:bg-white rounded-full transition-all duration-300
              ${isOpen ? "rotate-45 top-2" : "rotate-0 top-0"}
            `}
            ></span>
            <span
              className={`
              absolute h-0.5 w-5 bg-gray-700 dark:bg-white rounded-full transition-all duration-300 top-2
              ${isOpen ? "opacity-0" : "opacity-100"}
            `}
            ></span>
            <span
              className={`
              absolute h-0.5 w-5 bg-gray-700 dark:bg-white rounded-full transition-all duration-300
              ${isOpen ? "-rotate-45 top-2" : "rotate-0 top-4"}
            `}
            ></span>
          </div>
        </button>

        {/* Mobile Sidebar with smooth animations */}
        <div
          className={`
            fixed inset-0 z-[1000] transition-all duration-500 ease-out
            ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
          `}
        >
          {/* Backdrop */}
          <div
            className={`
              absolute inset-0 bg-black/40 backdrop-blur-sm
              transition-all duration-500 ease-out
              ${isOpen ? "opacity-100" : "opacity-0"}
            `}
            onClick={handleClose}
          />

          {/* Sidebar */}
          <div
            ref={mobileMenuRef}
            className={`
              fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl rounded-l-2xl
              transition-all duration-500 ease-out
              ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2"></div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col p-4 dark:bg-gray-800 gap-1">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      activeTab === item.id
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }
                    ${isOpen ? "animate-slideInItem" : ""}
                  `}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="flex-1 text-left font-medium">
                    {item.label}
                  </span>
                  {activeTab === item.id && (
                    <span className="text-yellow-500">✓</span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full
                  ${
                    activeTab === "settings"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                  }
                  ${isOpen ? "animate-slideInItem" : ""}
                `}
                style={{
                  animationDelay: `0.15s`,
                }}
              >
                <span className="text-2xl">⚙️</span>
                <span className="flex-1 text-left font-medium">Settings</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${settingsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {settingsOpen && (
                <div className="ml-4 mt-1 pl-4 border-l-2 border-yellow-500/30 space-y-1 overflow-hidden">
                  <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-sm animate-slideDown">
                    <span>🌓</span>
                    <span>Toggle Theme</span>
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-sm animate-slideDown">
                    <span>🗺️</span>
                    <span>Map Style</span>
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-sm text-red-600 dark:text-red-400 animate-slideDown">
                    <span>🗑️</span>
                    <span>Clear Saved Data</span>
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ClearAllPointsButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Points Toggle Bar */}
      {showBar && (
        <div className="absolute top-full left-0 right-0 mt-2 flex justify-center z-[1050] px-4">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-2xl rounded-xl p-3 border border-white/10 w-full max-w-md animate-slideDown">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">✨</span>
                Add Extra Points
              </span>
              <button
                onClick={toggleShowbar}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInItem {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInItem {
          animation: slideInItem 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
      `}</style>
    </>
  );
}
