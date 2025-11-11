import { motion } from "framer-motion";

export default function PointsToggleBtn({ closePoints, handleClosePoints }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, x: closePoints ? 4 : -4 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: "easeOut" },
      }}
      initial={{ opacity: 0, x: 10 }}
      onClick={handleClosePoints}
      className={`fixed toppest top-1/3 right-0 z-[1100] px-2.5 py-1.5 text-xs font-semibold 
        rounded-l-full backdrop-blur-sm shadow-lg border transition-all duration-500
        ${
          closePoints
            ? "bg-red-600/80 border-red-400/40 hover:bg-red-500/80 text-white shadow-red-300/30"
            : "bg-emerald-600/80 hover:bg-emerald-500/80 text-white shadow-emerald-300/30"
        }`}
    >
      {closePoints ? "Close Points" : "Show Points"}
    </motion.button>
  );
}
