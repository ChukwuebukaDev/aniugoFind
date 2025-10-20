import { useState } from "react";
import extraPointBarToggler from "../utilities/helperHook";

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { showBar, toggleShowbar } = extraPointBarToggler();

  const handleClose = () => setIsOpen(false);

  return (
    <nav className="flex items-center justify-between relative z-[1000] px-4 py-2  text-white">
      {/* Desktop menu */}
      <div className="hidden md:flex gap-6 items-center">
        <button className="hover:text-gray-200 transition-colors">Home</button>
        <button
          className="hover:text-gray-200 transition-colors cursor-pointer"
          onClick={toggleShowbar}
        >
          Add Points
        </button>
        <button className="hover:text-gray-200 transition-colors">
          Routes
        </button>
        <button className="hover:text-gray-200 transition-colors">
          Settings
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
        <button className="" onClick={() => setIsOpen(!isOpen)}>
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

        {/* Sliding mobile menu */}
        <div className="relative">
          <div
            className={`fixed top-0 right-0 h-full w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-l-xl z-[1001] transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex flex-col mt-16 px-4 gap-2">
              <span
                title="close"
                onClick={handleClose}
                className="absolute hover:border-b-2 cursor-pointer left-0 top-0 p-2"
              >
                ❌
              </span>
              <button
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
                onClick={handleClose}
              >
                Home
              </button>
              <button
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left rounded-md"
                onClick={toggleShowbar}
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
      </div>
    </nav>
  );
}
