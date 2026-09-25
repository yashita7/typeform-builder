"use client";

/**
 * Modal for creating a new form.
 * Enhanced with smooth animations and better UX.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export function CreateFormModal({
  isOpen,
  onClose,
  onCreate,
}: CreateFormModalProps) {
  const [title, setTitle] = useState("");

  // Reset title when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
    }
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
      setTitle("");
    }
  }

  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-semibold text-neutral-900 mb-6">
                Create a new form
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="form-title"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Form title
                  </label>
                  <input
                    id="form-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Customer Feedback Survey"
                    autoFocus
                    className="w-full px-4 py-3 text-base border-2 border-neutral-200 rounded-lg focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-5 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="flex-1 px-5 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-sm"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
