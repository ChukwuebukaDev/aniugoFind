import { motion } from "framer-motion";

export default function TextInputBtn({ showInput, setShowInput }) {
  return (
    <div className="flex">
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          setShowInput((prev) => !prev);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        }}
        initial={{ opacity: 0, x: -10 }}
        className={`fixed top-1/2 left-0 z-[1100] px-2.5 py-1.5 text-xs font-semibold 
          rounded-r-full backdrop-blur-sm shadow-lg border transition-all duration-500 
          ${
            showInput
              ? "bg-red-600/80 border-red-400/40 hover:bg-red-500/80 text-white shadow-red-300/30"
              : "bg-emerald-600/80 border-emerald-400/40 hover:bg-emerald-500/80 text-white shadow-emerald-300/30"
          }`}
      >
        {showInput ? "Hide Bar" : "Enter Coords"}
      </motion.button>
    </div>
  );
}
