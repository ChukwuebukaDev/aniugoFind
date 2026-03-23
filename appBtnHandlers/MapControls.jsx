import { motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUiStore } from "../Zustand/uiState";

export function MapControls() {

  const {
    isSidebarOpen,
    showImporter,
    autoCluster,
    showInput,
    closePoints,
    darkTheme,
    activeControl,
    toggleControl,
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
        id: "sidebar",
        label: isSidebarOpen ? "Hide Saved" : "Show Saved",
        icon: <img src="images/memory.png" className="w-6 h-6" />,
      },
      {
        id: "importer",
        label: showImporter ? "Close Form" : "Upload Excel",
        icon: <img src="images/excel.png" className="w-6 h-6" />,
      },
      {
        id: "cluster",
        label: autoCluster ? "Stop Cluster" : "Auto Cluster",
        icon: <img src="images/cluster.png" className="w-6 h-6" />,
      },
      {
        id: "input",
        label: showInput ? "Close Input" : "Enter Points",
        icon: <img src="images/input.png" className="w-6 h-6" />,
      },
      {
        id: "points",
        label: closePoints ? "Show Points" : "Hide Points",
        icon: <img src="images/bulk.png" className="w-6 h-6" />,
      },
    ],
    [isSidebarOpen, showImporter, autoCluster, showInput, closePoints]
  );

  const handleMenuToggle = () => {
    setDrawerOpen((v) => !v);
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center z-[500] pointer-events-none">


      <motion.button
        onClick={handleMenuToggle}
        className="pointer-events-auto mb-10 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white text-lg font-bold bg-emerald-500 hover:bg-emerald-400"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        {drawerOpen ? <X size={20} /> : "☰"}
      </motion.button>

   
        {controls.map((control, i) => {

          const active = activeControl === control.id;

          return (
            <motion.button
              key={control.id}
              initial={{ opacity: 0, x: 0 }}
              animate={{
                opacity: drawerOpen ? 1 : 0,
                x: drawerOpen ?(i - 2) * 70 : 0,
                y: drawerOpen ? -120 : 0 ,
                scale: drawerOpen ? 1 : 0.7,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: i * 0.05,
              }}
              onClick={() => {toggleControl(control.id);console.log(control.id)}}
              className={`pointer-events-auto absolute w-14 h-14 rounded-full flex items-center justify-center border shadow-md transition-all
                
                ${
                  active
                    ? "bg-emerald-500 text-white shadow-emerald-400/50"
                    : darkTheme
                    ? "bg-neutral-800 text-white"
                    : "bg-white text-black"
                }

              `}
            >
              {control.icon}
            </motion.button>
          );
        })}

      {/* Hint */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute left-28 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 ${
            darkTheme
              ? "bg-emerald-600 text-white"
              : "bg-emerald-400 text-black"
          }`}
        >
          <HelpCircle size={14} />
          Tap ☰ to open controls
        </motion.div>
      )}
    </div>
  );
}