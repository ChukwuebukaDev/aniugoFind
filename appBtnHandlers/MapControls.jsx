"use client";

import { motion } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Layers,
  FileInput,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUiStore } from "../Zustand/uiState";

/* Drawer animation states
   bottom-0 + positive y hides it
   bottom-0 + y:0 shows it
*/
const drawerVariants = {
  peek: { y: 90 },
  open: { y: 0 },
};

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
        icon: <FolderOpen size={20} />,
        onClick: toggleSidebar,
        active: isSidebarOpen,
      },
      {
        label: showImporter ? "Close Form" : "Upload Excel",
        icon: <Upload size={20} />,
        onClick: toggleShowImporter,
        active: showImporter,
      },
      {
        label: autoCluster ? "Stop Cluster" : "Auto Cluster",
        icon: <Layers size={20} />,
        onClick: toggleAutoCluster,
        active: autoCluster,
      },
      {
        label: showInput ? "Close Input" : "Enter Points",
        icon: <FileInput size={20} />,
        onClick: toggleShowInput,
        active: showInput,
      },
      {
        label: closePoints ? "Show Points" : "Hide Points",
        icon: <BookOpen size={20} />,
        onClick: toggleClosePoints,
        active: !closePoints,
      },
    ],
    [isSidebarOpen, showImporter, autoCluster, showInput, closePoints]
  );

  return (
    <div className="fixed bottom-0 left-0 w-full z-[2000] pointer-events-none">
      <motion.div
        variants={drawerVariants}
        initial="peek"
        animate={drawerOpen ? "open" : "peek"}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className={`
          pointer-events-auto
          mx-auto
          w-full max-w-md
          rounded-t-2xl
          p-4 pb-5
          shadow-2xl
          border-t border-white/10
          ${darkTheme ? "bg-neutral-900" : "bg-neutral-100"}
        `}
      >
        {/* Drawer Handle */}
        <button
          aria-label="Toggle map controls"
          onClick={() => setDrawerOpen((v) => !v)}
          className="w-full flex justify-center mb-3"
        >
          <div
            className={`h-1.5 w-12 rounded-full transition-colors ${
              darkTheme ? "bg-neutral-400" : "bg-neutral-600"
            }`}
          />
        </button>

        {/* Controls */}
        <div className="flex justify-between gap-3 px-2">
          {controls.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center"
            >
              <button
                aria-label={c.label}
                aria-pressed={c.active}
                onClick={c.onClick}
                className={`
                  w-11 h-11
                  rounded-full
                  flex items-center justify-center
                  border border-white/20
                  shadow-md
                  transition-all
                  active:scale-95
                  ${
                    darkTheme
                      ? c.active
                        ? "bg-emerald-600 text-white shadow-emerald-500/40"
                        : "bg-neutral-800 hover:bg-neutral-700 text-white"
                      : c.active
                      ? "bg-emerald-500 text-black shadow-emerald-400/40"
                      : "bg-white hover:bg-neutral-200 text-black"
                  }
                `}
              >
                {c.icon}
              </button>

              <span
                className={`mt-1 text-[11px] font-medium text-center ${
                  darkTheme ? "text-neutral-200" : "text-neutral-800"
                }`}
              >
                {c.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Mobile Hint */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              absolute -top-10 left-1/2 -translate-x-1/2
              px-3 py-1.5
              rounded-full
              text-xs font-medium
              shadow-lg
              flex items-center gap-1
              ${
                darkTheme
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-400 text-black"
              }
            `}
          >
            <HelpCircle size={14} />
            Tap controls to interact
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
