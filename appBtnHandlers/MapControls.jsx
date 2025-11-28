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
    darkTheme, // make sure this exists in your store
  } = useUiStore();

  const [showMobileHint, setShowMobileHint] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowMobileHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const controls = [
    {
      label: isSidebarOpen ? "Hide Saved" : "Show Saved",
      icon: <FolderOpen size={20} />,
      onClick: toggleSidebar,
    },
    {
      label: showImporter ? "Close Form" : "Upload Excel",
      icon: <Upload size={20} />,
      onClick: toggleShowImporter,
    },
    {
      label: autoCluster ? "Stop Cluster" : "Auto Cluster",
      icon: <Layers size={20} />,
      onClick: toggleAutoCluster,
    },
    {
      label: showInput ? "Close Input" : "Enter Points",
      icon: <FileInput size={20} />,
      onClick: toggleShowInput,
    },
    {
      label: closePoints ? "Hide Points" : "Show Points",
      icon: <BookOpen size={20} />,
      onClick: toggleClosePoints,
    },
  ];

  return (
    <div className="fixed bottom-25 left-0 w-full z-[2000] flex justify-center pointer-events-none">
      <motion.div
        className={`w-full max-w-md rounded-t-2xl p-4 shadow-xl pointer-events-auto
              border-t border-white/20
              ${darkTheme ? "bg-neutral-900" : "bg-neutral-100"}`}
        initial={{ y: 200 }} // start slightly below bottom
        animate={{ y: openDrawer ? 100 : 200 }} // slide up to visible
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Drawer handle */}
        <div
          className="w-full flex justify-center mb-2 cursor-pointer"
          onClick={() => setOpenDrawer(!openDrawer)}
        >
          <div
            className={`h-1.5 w-12 rounded-full ${
              darkTheme ? "bg-gray-400" : "bg-gray-600"
            }`}
          ></div>
        </div>

        {/* Button grid */}
        <div className="flex justify-between gap-4 px-2">
          {controls.map((control, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 220 }}
            >
              <button
                onClick={control.onClick}
                className={`flex items-center justify-center w-11 h-11
                            rounded-full shadow-md border border-white/20
                            transition-all ${
                              darkTheme
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-emerald-400 hover:bg-emerald-500 text-black"
                            }`}
              >
                {control.icon}
              </button>
              <span
                className={`text-xs mt-1 text-center font-semibold ${
                  darkTheme ? "text-white" : "text-black"
                }`}
              >
                {control.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Optional mobile hint */}
        {showMobileHint && (
          <motion.div
            className={`absolute bottom-3 left-1/2 -translate-x-1/2 p-2 rounded-full
                        shadow-lg flex items-center gap-1 text-xs
                        ${
                          darkTheme
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-400 text-black"
                        }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HelpCircle size={14} />
            Tap buttons to see controls
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
