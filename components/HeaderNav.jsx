import { useState } from "react";

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <nav className="flex items-center">
      {/* Desktop menu */}
      <div className="hidden md:flex gap-6">
        <button className="hover:text-gray-200 transition-colors">Home</button>
        <button className="hover:text-gray-200 transition-colors">
          Add Points
        </button>
        <button className="hover:text-gray-200 transition-colors">
          Routes
        </button>
        <button className="hover:text-gray-200 transition-colors">
          Settings
        </button>
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden relative">
        <button
          className="p-2 rounded cursor-pointer transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
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

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[900] transition-opacity duration-300"
            onClick={handleClose}
          ></div>
        )}

        {/* Sliding menu */}
        <div
          className={`fixed top-0 right-0 h-full w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-l-xl z-[1000] transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="flex flex-col mt-16 px-4 gap-2">
            <button
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
              onClick={handleClose}
            >
              Home
            </button>
            <button
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
              onClick={handleClose}
            >
              Add Points
            </button>
            <button
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
              onClick={handleClose}
            >
              Routes
            </button>
            <button
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
              onClick={handleClose}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
