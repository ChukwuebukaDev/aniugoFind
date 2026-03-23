"use client";

import { useState, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthGate({ children }: Props) {
  const pins = ['12', '68', '1865', '9090'];

  const [open, setOpen] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const isAuth = localStorage.getItem("auth");
    if (isAuth === "true") {
      setOpen(false);
    }
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const valid = pins.includes(pin);

      if (!valid) {
        setError("Invalid PIN");
        setLoading(false);
        return;
      }

      // ✅ Save auth
      localStorage.setItem("auth", "true");

      setLoading(false);
      setOpen(false);
    }, 800); // simulate backend delay
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setOpen(true);
    setPin('');
  };

  // 🔒 Lock screen
  if (open) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-black/80">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-xl flex flex-col gap-4 w-[300px]"
        >
          <h2 className="text-xl font-semibold text-center">
            Enter Security PIN
          </h2>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="p-3 border rounded-xl text-center text-lg"
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-3 rounded-xl"
          >
            {loading ? "Checking..." : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  
  return (
    <>
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg"
      >
        Logout
      </button>

      {children}
    </>
  );
}