"use client";

/**
 * Menu for adding new questions of different types.
 * Shows all 8 question types with icons.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { Question } from "@/lib/types";

interface AddQuestionMenuProps {
  onAddQuestion: (type: Question["type"]) => void;
}

export function AddQuestionMenu({ onAddQuestion }: AddQuestionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const questionTypes: Array<{ type: Question["type"]; label: string; icon: string }> = [
    { type: "short_text", label: "Short text", icon: "📝" },
    { type: "long_text", label: "Long text", icon: "📄" },
    { type: "multiple_choice", label: "Multiple choice", icon: "☑️" },
    { type: "dropdown", label: "Dropdown", icon: "📋" },
    { type: "email", label: "Email", icon: "📧" },
    { type: "number", label: "Number", icon: "🔢" },
    { type: "yes_no", label: "Yes/No", icon: "✓✗" },
    { type: "rating", label: "Rating", icon: "⭐" },
  ];

  const comingSoonTypes = [
    { label: "File Upload", icon: "📎" },
    { label: "Payment", icon: "💳" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add question
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {questionTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => {
                  onAddQuestion(type);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3 border-b border-neutral-100 last:border-b-0"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-neutral-900">{label}</span>
              </button>
            ))}
            
            {/* Coming Soon Section */}
            <div className="border-t-2 border-neutral-200 bg-neutral-50 px-4 py-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Coming Soon
              </p>
              {comingSoonTypes.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => {
                    toast.info(`${label} question type coming soon!`);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-100 transition-colors flex items-center gap-3 rounded"
                >
                  <span className="text-xl opacity-50">{icon}</span>
                  <span className="text-sm text-neutral-500">{label}</span>
                  <span className="ml-auto text-xs text-neutral-400">🚧</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
