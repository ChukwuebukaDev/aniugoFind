"use client";

import { motion } from "framer-motion";
import { HelpCircle ,X} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUiStore } from "../Zustand/uiState";

export function MapControls() {
  const {
    showInput,
    toggleShowInput,
    autoCluster,
    isSidebarOpen,
    showImporter,
    toggleAutoCluster,
    toggleShowImporter,
    toggleSidebar,
    closePoints,
    toggleClosePoints,
    darkTheme,
  } = useUiStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const controls = useMemo(
    () => [
      {
        label: isSidebarOpen ? "Hide Saved" : "Show Saved",
        icon: <img src="images/memory.png" />,
        onClick: toggleSidebar,
        active: isSidebarOpen,
      },
      {
        label: showImporter ? "Close Form" : "Upload Excel",
        icon: <img src="images/excel.png" />,
        onClick: toggleShowImporter,
        active: showImporter,
      },
      {
        label: autoCluster ? "Stop Cluster" : "Auto Cluster",
        icon: <img src="images/cluster.png" />,
        onClick: toggleAutoCluster,
        active: autoCluster,
      },
      {
        label: showInput ? "Close Input" : "Enter Points",
        icon: <img src="images/input.png" />,
        onClick: toggleShowInput,
        active: showInput,
      },
      {
        label: closePoints ? "Show Points" : "Hide Points",
        icon: <img src="images/bulk.png" />,
        onClick: toggleClosePoints,
        active: !closePoints,
      },
    ],
    [isSidebarOpen, showImporter, autoCluster, showInput, closePoints]
  );

  return (
    <>
      {/* Central Menu Button */}
 <div className="fixed inset-0 flex items-center justify-start z-[2000] pointer-events-none">
       <motion.button
    onClick={() => setDrawerOpen((v) => !v)}
    className="pointer-events-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white text-lg font-bold transition-colors
      bg-emerald-500 hover:bg-emerald-400"
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
  >
    {!drawerOpen ? '☰' : <X size={18}/>}
  </motion.button>

        {/* Controls Sliding Out */}
        <div className="absolute flex flex-col items-center gap-3 pointer-events-auto">
         {controls.map((c, i) => (
    <motion.button
      key={c.label}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: drawerOpen ? 1 : 0,
        x: drawerOpen ? (i + 1) * 70 : 0, 
         y: drawerOpen ? 70 * (i % 3) - 70 : 0,
        scale: drawerOpen ? 1 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.05 }}
      onClick={c.onClick}
      className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-md transition-colors active:scale-95 bg-white text-black"
      style={{
        position: "absolute", // this makes them stack around the center button
      }}
    >
      {c.icon}
    </motion.button>
  ))}
        </div>

        {/* Mobile Hint */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute -top-20 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 ${
              darkTheme ? "bg-emerald-600 text-white" : "bg-emerald-400 text-black"
            }`}
          >
            <HelpCircle size={14} />
            Tap ☰ to open controls
          </motion.div>
        )}
      </div>
    </>
  );
}