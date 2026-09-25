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
      <div className="group bg-white border-2 border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 hover:shadow-xl transition-all duration-300">
        {/* Title (editable on click) */}
        <div className="mb-4">
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
              className="w-full text-xl font-semibold text-neutral-900 border-2 border-neutral-900 rounded-lg px-3 py-2 focus:outline-none"
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-xl font-semibold text-neutral-900 cursor-text hover:text-neutral-700 transition-colors line-clamp-2 min-h-[3.5rem]"
            >
              {form.title}
            </h3>
          )}
        </div>

        {/* Status badge and response count */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              form.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {form.status === "published" ? "● Published" : "○ Draft"}
          </span>
          <a
            href={`/forms/${form.id}/responses`}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
          >
            {form.response_count}{" "}
            {form.response_count === 1 ? "response" : "responses"}
          </a>
        </div>

        {/* Shareable link (if published) */}
        <AnimatePresence>
          {publicUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="flex-1 text-sm text-neutral-600 bg-transparent border-none focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-white rounded transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Edit (go to builder) */}
          <a
            href={`/forms/${form.id}/edit`}
            className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 active:scale-95 transition-all text-center shadow-sm"
          >
            Edit
          </a>

          {/* Publish/Unpublish */}
          {form.status === "draft" ? (
            <button
              onClick={() => onPublish(form.id)}
              className="px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-lg hover:bg-neutral-200 active:scale-95 transition-all"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={() => onUnpublish(form.id)}
              className="px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-lg hover:bg-neutral-200 active:scale-95 transition-all"
            >
              Unpublish
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={() => onDuplicate(form.id)}
            className="px-3 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-lg hover:bg-neutral-200 active:scale-95 transition-all"
            title="Duplicate"
          >
            <svg
              className="w-4 h-4"
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
            className="px-3 py-2.5 bg-neutral-100 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 hover:text-red-700 active:scale-95 transition-all"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
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

      {/* Delete confirmation dialog with animation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                Delete form?
              </h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                This will permanently delete <strong>"{form.title}"</strong> and all its responses.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-5 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-5 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm"
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
