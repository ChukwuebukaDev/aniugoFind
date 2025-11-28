import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function ConfirmModal({
  show,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  onConfirm,
  onCancel,
  reply = "Delete",
}) {
  const modalRef = useRef(null);

  // 🔒 Lock background scroll when modal is shown
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [show]);

  // 🧭 Auto-scroll modal into view if it’s off-screen
  useEffect(() => {
    if (show && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="confirmOverlay"
          ref={modalRef}
          className="absolute inset-0 flex items-center justify-center 
           pointer-events-none backdrop-blur-sm bg-black/40 z-[2000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            key="confirmBox"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[90%] max-w-md p-6 rounded-2xl shadow-2xl 
           bg-white/95 dark:bg-gray-900/95 border border-gray-300 
           dark:border-gray-700 text-center pointer-events-auto"
          >
            {/* Title */}
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-md font-semibold bg-gray-200 
                           hover:bg-gray-300 text-gray-900 dark:bg-gray-700 
                           dark:hover:bg-gray-600 dark:text-gray-100 transition-all duration-200"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-md font-semibold bg-red-600 
                           hover:bg-red-500 text-white shadow-md transition-all duration-200"
              >
                {reply}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
