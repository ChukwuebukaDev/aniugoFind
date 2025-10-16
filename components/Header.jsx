import useDarkMode from "../Themes/useDarkMode";
import HeaderNav from "./HeaderNav";

export default function Header() {
  const [theme, toggleTheme] = useDarkMode();

  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 shadow-md transition-colors duration-300">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        aniugoFind📍
      </h1>
      <div className="flex">
        <button
          onClick={toggleTheme}
          className="cursor-pointer mr-1.5 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors duration-300"
          aria-label="Toggle Dark Mode"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <HeaderNav />
      </div>
    </header>
  );
}
