import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
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

  const [open, setOpen] = useState(false);

  const controls = useMemo(
    () => [
      {
        id: "sidebar",
        icon: <img src="images/memory.png" width={36} alt="Sidebar" />,
        active: isSidebarOpen,
      },
      {
        id: "importer",
        icon: <img src="images/excel.png" width={36} alt="Importer" />,
        active: showImporter,
      },
      {
        id: "cluster",
        icon: <img src="images/cluster.png" width={36} alt="Cluster" />,
        active: autoCluster,
      },
      {
        id: "input",
        icon: <img src="images/input.png" width={36} alt="Input" />,
        active: showInput,
      },
      {
        id: "points",
        icon: <img src="images/bulk.png" width={36} alt="Points" />,
        active: closePoints,
      },
    ],
    [isSidebarOpen, showImporter, autoCluster, showInput, closePoints],
  );

  return (
    <>
      {/* BACKDROP */}
      <AnimatePresence>
        {open && (
          <motion.div
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[6px] z-[400]"
          />
        )}
      </AnimatePresence>

      {/* CONTAINER - Bottom Center */}
      <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center z-[500] pointer-events-none">
        <div className="pointer-events-auto">
          <motion.div
            layout
            className="relative flex flex-col items-center justify-center"
          >
            {/* CONTROL PANEL */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`
                    grid grid-cols-3 gap-3 p-3 mb-4
                    rounded-3xl
                    backdrop-blur-2xl
                    border
                    shadow-2xl
                    ${
                      darkTheme
                        ? "bg-white/5 border-white/10"
                        : "bg-white/70 border-black/10"
                    }
                  `}
                >
                  {controls.map((c) => (
                    <motion.button
                      key={c.id}
                      onClick={() => toggleControl(c.id)}
                      whileTap={{ scale: 0.92 }}
                      whileHover={{ scale: 1.05 }}
                      className={`
                        relative w-14 h-14 rounded-2xl
                        flex items-center justify-center
                        text-lg
                        transition-all duration-300
                        ${
                          c.active
                            ? "bg-white/20 shadow-inner"
                            : darkTheme
                              ? "bg-white/5 hover:bg-white/10"
                              : "bg-black/5 hover:bg-black/10"
                        }
                      `}
                    >
                      {/* subtle glow for active */}
                      {c.active && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 rounded-2xl bg-white/10 blur-md"
                        />
                      )}

                      <span className="relative z-10">{c.icon}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN BUTTON */}
            <motion.button
              onClick={() => setOpen(!open)}
              whileTap={{ scale: 0.92 }}
              animate={{
                scale: open ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`
                w-16 h-16 rounded-full
                flex items-center justify-center
                text-xl
                backdrop-blur-2xl
                border
                shadow-xl
                transition-all duration-300
                ${
                  darkTheme
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/80 border-black/10 text-black"
                }
              `}
            >
              <motion.span
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                +
              </motion.span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
