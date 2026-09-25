"use client";

/**
 * Form card component displaying a single form with actions.
 * Enhanced with smooth animations, better hover states, and improved UX.
 */

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { FormListItem } from "@/lib/types";

interface FormCardProps {
  form: FormListItem;
  onRename: (id: number, newTitle: string) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onUnpublish: (id: number) => void;
}

export function FormCard({
  form,
  onRename,
  onDuplicate,
  onDelete,
  onPublish,
  onUnpublish,
}: FormCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(form.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get the shareable public URL
  const publicUrl = form.share_slug
    ? `${window.location.origin}/f/${form.share_slug}`
    : null;

  // Handle title edit
  function handleTitleSubmit() {
    if (editedTitle.trim() && editedTitle !== form.title) {
      onRename(form.id, editedTitle.trim());
    } else {
      setEditedTitle(form.title); // Reset if empty or unchanged
    }
    setIsEditing(false);
  }

  // Copy public URL to clipboard
  function handleCopyLink() {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied to clipboard");
    }
  }

  // Handle delete with confirmation
  function handleDeleteClick() {
    setShowDeleteConfirm(true);
  }

  function handleDeleteConfirm() {
    onDelete(form.id);
    setShowDeleteConfirm(false);
  }

  return (
    <>
      <div className="group bg-white border border-neutral-200 rounded-3xl p-10 hover:border-neutral-300 hover:shadow-lg transition-all duration-200">
        {/* Title (editable on click) - Larger and bolder */}
        <div className="mb-6">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") {
                  setEditedTitle(form.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="w-full text-3xl font-bold text-black border-2 border-black rounded-lg px-4 py-3 focus:outline-none"
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-3xl font-bold text-black cursor-text hover:text-neutral-700 transition-colors line-clamp-2 min-h-[4.5rem]"
            >
              {form.title}
            </h3>
          )}
        </div>

        {/* Status badge and response count - More generous spacing */}
        <div className="flex items-center gap-4 mb-8">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              form.status === "published"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-neutral-50 text-neutral-600 border border-neutral-200"
            }`}
          >
            {form.status === "published" ? "● Published" : "○ Draft"}
          </span>
          <a
            href={`/forms/${form.id}/responses`}
            className="text-base text-neutral-500 hover:text-black transition-colors font-medium"
          >
            {form.response_count}{" "}
            {form.response_count === 1 ? "response" : "responses"}
          </a>
        </div>

        {/* Shareable link (if published) - More prominent */}
        <AnimatePresence>
          {publicUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 text-sm text-neutral-700 bg-transparent border-none focus:outline-none truncate font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 text-sm font-medium text-neutral-800 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-neutral-200"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions - Larger buttons with more padding */}
        <div className="flex items-center gap-3">
          {/* Edit (go to builder) */}
          <a
            href={`/forms/${form.id}/edit`}
            className="flex-1 px-6 py-4 bg-black text-white text-base font-semibold rounded-xl hover:bg-neutral-800 active:scale-98 transition-all text-center shadow-sm"
          >
            Edit
          </a>

          {/* Publish/Unpublish */}
          {form.status === "draft" ? (
            <button
              onClick={() => onPublish(form.id)}
              className="px-6 py-4 bg-neutral-100 text-neutral-800 text-base font-semibold rounded-xl hover:bg-neutral-200 active:scale-98 transition-all border border-neutral-200"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={() => onUnpublish(form.id)}
              className="px-6 py-4 bg-neutral-100 text-neutral-800 text-base font-semibold rounded-xl hover:bg-neutral-200 active:scale-98 transition-all border border-neutral-200"
            >
              Unpublish
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={() => onDuplicate(form.id)}
            className="px-4 py-4 bg-neutral-100 text-neutral-800 rounded-xl hover:bg-neutral-200 active:scale-98 transition-all border border-neutral-200"
            title="Duplicate"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteClick}
            className="px-4 py-4 bg-neutral-100 text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 active:scale-98 transition-all border border-neutral-200"
            title="Delete"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog with animation - Cleaner design */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-6">⚠️</div>
              <h3 className="text-3xl font-bold text-black mb-4">
                Delete form?
              </h3>
              <p className="text-neutral-700 mb-8 leading-relaxed text-lg">
                This will permanently delete <strong className="text-black">"{form.title}"</strong> and all its responses.
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-4 bg-neutral-100 text-neutral-800 font-semibold rounded-xl hover:bg-neutral-200 active:scale-98 transition-all border border-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-6 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:scale-98 transition-all shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
