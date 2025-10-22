import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-gray-800/90 text-white rounded-xl shadow-lg p-5 w-80 text-center border border-gray-700"
            initial={{ y: 40, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing on inner click
          >
            <h4 className="text-lg font-semibold mb-3">{title}</h4>
            <p className="text-sm mb-5 text-gray-300">{message}</p>
            <div className="flex justify-around">
              <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold shadow-md cursor-pointer"
              >
                Yes, Confirm
              </button>
              <button
                onClick={onCancel}
                className="cursor-pointer bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg font-bold shadow-md"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
