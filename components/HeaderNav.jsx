import { useState, useRef, useEffect } from "react";
import extraPointBarToggler from "../utilities/helperHook";

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { showBar, toggleShowbar } = extraPointBarToggler();
  const settingsRef = useRef(null);

  const handleClose = () => setIsOpen(false);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);

    if (tab !== "settings") setSettingsOpen(false);
    if (tab === "addPoints") toggleShowbar();
    if (tab === "routes") console.log("Routes clicked");
    if (tab === "saved") console.log("Saved clicked");
  };

  return (
    <nav className="flex items-center justify-between relative z-[1000] px-4 py-2 text-white">
      {/* Desktop menu */}
      <div className="hidden md:flex gap-6 items-center">
        <button
          onClick={() => handleNavClick("home")}
          className={`hover:text-gray-200 transition-colors ${
            activeTab === "home" ? "font-semibold text-yellow-300" : ""
          }`}
        >
          Home
        </button>

        <button
          onClick={() => handleNavClick("addPoints")}
          className={`hover:text-gray-200 transition-colors ${
            activeTab === "addPoints" ? "font-semibold text-yellow-300" : ""
          }`}
        >
          Add Points
        </button>

        <button
          onClick={() => handleNavClick("routes")}
          className={`hover:text-gray-200 transition-colors ${
            activeTab === "routes" ? "font-semibold text-yellow-300" : ""
          }`}
        >
          Routes
        </button>

        {/* Settings dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => {
              setActiveTab("settings");
              setSettingsOpen((prev) => !prev);
            }}
            className={`hover:text-gray-200 transition-colors ${
              activeTab === "settings" ? "font-semibold text-yellow-300" : ""
            } flex items-center gap-1`}
          >
            Settings
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transition-transform ${
                settingsOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {settingsOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg rounded-xl w-48 py-2 z-[1050] animate-fadeIn">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Toggle Theme
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Map Style
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Clear Saved Data
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => handleNavClick("saved")}
          className={`hover:text-gray-200 transition-colors ${
            activeTab === "saved" ? "font-semibold text-yellow-300" : ""
          }`}
        >
          Saved
        </button>
      </div>

      {/* AddExtraPoints toggle bar */}
      {showBar && (
        <div className="absolute top-full mt-2 left-0 w-full flex justify-center pointer-events-none">
          <div className="bg-white text-black dark:bg-gray-800 dark:text-white shadow-lg rounded-xl p-3 pointer-events-auto z-[1050]"></div>
        </div>
      )}

      {/* Mobile hamburger */}
      <div className="md:hidden relative">
        <button onClick={() => setIsOpen(!isOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[900] transition-opacity duration-300"
            onClick={handleClose}
          ></div>
        )}

        <div className="relative">
          <div
            className={`fixed top-0 right-0 h-full w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-l-xl z-[1001] transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex flex-col mt-16 px-4 gap-2 topper relative">
              <span
                title="close"
                onClick={handleClose}
                className="absolute hover:border-b-2 cursor-pointer left-0 top-0 p-2"
              >
                ❌
              </span>

              <button
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
                onClick={() => handleNavClick("home")}
              >
                Home
              </button>

              <button
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
                onClick={() => handleNavClick("addPoints")}
              >
                Add Points
              </button>

              <button
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
                onClick={() => handleNavClick("routes")}
              >
                Routes
              </button>

              {/* Settings dropdown for mobile */}
              <details className="group">
                <summary className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer list-none flex justify-between items-center">
                  Settings
                  <span className="transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="ml-4 flex flex-col gap-1 pb-2">
                  <button className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    Toggle Theme
                  </button>
                  <button className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    Map Style
                  </button>
                  <button className="text-left text-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    Clear Saved Data
                  </button>
                </div>
              </details>

              <button
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
                onClick={() => handleNavClick("saved")}
              >
                Saved
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
