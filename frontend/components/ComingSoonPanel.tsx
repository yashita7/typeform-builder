/**
 * Coming Soon placeholder panel
 * Used for features listed as "mocked" in product.md
 * Enhanced with better visuals and animations
 */

import { motion } from "framer-motion";

interface ComingSoonPanelProps {
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  size?: "default" | "large";
}

export function ComingSoonPanel({
  title,
  description,
  icon = "🚀",
  features,
  size = "default",
}: ComingSoonPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-gradient-to-br from-neutral-50 via-white to-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl text-center ${
        size === "large" ? "p-12" : "p-8"
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`${size === "large" ? "text-7xl mb-6" : "text-5xl mb-4"}`}
      >
        {icon}
      </motion.div>
      
      <h3 className={`font-semibold text-neutral-900 mb-3 ${
        size === "large" ? "text-3xl" : "text-xl"
      }`}>
        {title}
      </h3>
      
      <p className={`text-neutral-600 mb-6 max-w-md mx-auto leading-relaxed ${
        size === "large" ? "text-lg" : "text-base"
      }`}>
        {description}
      </p>
      
      {features && features.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex flex-col gap-2.5 text-left mb-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 text-sm text-neutral-700"
            >
              <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="inline-block px-5 py-2.5 bg-neutral-200 text-neutral-600 text-sm font-semibold rounded-full">
          Coming Soon
        </span>
      </motion.div>
    </motion.div>
  );
}
