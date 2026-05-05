import HeaderNav from "./HeaderNav";
import { useState, useEffect } from "react";
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-500
        transition-all duration-500 ease-out
        ${
          scrolled
            ? "py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl"
            : "py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg"
        }
        border-b border-white/20 dark:border-gray-700/30
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Premium Logo */}
          <div className="group relative">
            <h1 className="relative text-2xl lg:text-3xl font-bold tracking-tight">
              <span className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500"></span>
              <span className="relative bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Ageo
              </span>
              <span className="relative inline-block ml-1 transform group-hover:scale-110 transition-transform duration-300">
                📍
              </span>
            </h1>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-500"></div>
          </div>

          {/* Navigation - Now with solid background */}
          <div className="flex items-center gap-2">
            <HeaderNav />

            {/* Get Started Button */}
            <button className="hidden md:inline-flex px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
