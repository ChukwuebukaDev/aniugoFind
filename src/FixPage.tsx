import { motion } from "framer-motion";
import { Wrench, RefreshCcw } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          className="absolute w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, -50, 0], y: [0, -100, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl right-0 bottom-0"
          animate={{ x: [0, -120, 60, 0], y: [0, 80, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center"
      >
        {/* Icon animation */}
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
            <Wrench className="text-white w-8 h-8" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          We'll be back soon
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 mb-6">
          Our site is currently undergoing scheduled maintenance. We're working
          hard to improve your experience.
        </p>

        {/* Animated loader */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh Page
        </motion.button>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-6">
          Estimated downtime: a few minutes
        </p>
      </motion.div>
    </div>
  );
}
