import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 shadow-md transition-colors duration-300">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        Ageo📍
      </h1>
      <div className="flex">
        <HeaderNav />
      </div>
    </header>
  );
}
