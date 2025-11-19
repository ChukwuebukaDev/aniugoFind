import { motion } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Layers,
  FileInput,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useUiStore } from "../Zustand/uiState";
import { useState, useEffect } from "react";

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
  } = useUiStore();

  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showMobileHint, setShowMobileHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowMobileHint(false), 4000); // hide hint after 4s
    return () => clearTimeout(t);
  }, []);

  const controls = [
    {
      label: isSidebarOpen ? "Hide Saved" : "Show Saved",
      icon: <FolderOpen size={18} />,
      onClick: toggleSidebar,
    },
    {
      label: showImporter ? "Close Form" : "Upload Excel",
      icon: <Upload size={18} />,
      onClick: toggleShowImporter,
    },
    {
      label: autoCluster ? "Stop Cluster" : "Auto Cluster",
      icon: <Layers size={18} />,
      onClick: toggleAutoCluster,
    },
    {
      label: showInput ? "Close Input" : "Enter Points",
      icon: <FileInput size={18} />,
      onClick: toggleShowInput,
    },
    {
      label: closePoints ? "Hide Points" : "Show Points",
      icon: <BookOpen size={18} />,
      onClick: toggleClosePoints,
    },
  ];

  return (
    <div className="fixed left-2 top-1/3 z-[2000] flex flex-col gap-3 pointer-events-auto">
      {controls.map((control, i) => (
        <motion.div key={i} className="relative">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 220 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              control.onClick();
              setActiveTooltip(i);
              setTimeout(() => setActiveTooltip(null), 1500);
            }}
            className="group h-10 w-10 rounded-full bg-emerald-500 shadow-md backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-emerald-600 transition-all relative"
          >
            {control.icon}

            {/* Pulse hint for mobile */}
            {showMobileHint && i === 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.2, 1], opacity: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full h-3 w-3"
              />
            )}
          </motion.button>

          {/* Tooltip */}
          <span
            className={`absolute left-12 px-2 py-1 rounded-md bg-neutral-900 text-white text-[10px] transition-opacity whitespace-nowrap shadow-lg ${
              activeTooltip === i ? "opacity-100" : "opacity-0"
            }`}
          >
            {control.label}
          </span>
        </motion.div>
      ))}

      {/* Optional help icon on mobile */}
      {showMobileHint && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2 rounded-full bg-emerald-600 text-white shadow-lg flex items-center gap-1 text-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HelpCircle size={14} />
          Tap buttons to see controls
        </motion.div>
      )}
    </div>
  );
}
