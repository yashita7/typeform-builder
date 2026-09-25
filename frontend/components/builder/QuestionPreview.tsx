"use client";

/**
 * Live preview of how the question will appear in the respondent flow.
 * Mirrors the one-question-at-a-time Typeform-style presentation.
 */

import type { Question } from "@/lib/types";

interface QuestionPreviewProps {
  question: Question;
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 min-h-[400px] flex flex-col">
      {/* Question number and title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-neutral-500">Question 1</span>
          {question.required && (
            <span className="text-sm text-red-600">*</span>
          )}
        </div>
        <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
          {question.title || "Untitled question"}
        </h3>
        {question.description && (
          <p className="text-neutral-600">{question.description}</p>
        )}
      </div>

      {/* Question input based on type */}
      <div className="flex-1">
        {question.type === "short_text" && (
          <input
            type="text"
            placeholder="Type your answer here..."
            disabled
            className="w-full px-4 py-3 border-b-2 border-neutral-300 focus:border-neutral-900 bg-transparent text-neutral-900 placeholder:text-neutral-400 disabled:opacity-70"
          />
        )}

        {question.type === "long_text" && (
          <textarea
            placeholder="Type your answer here..."
            rows={6}
            disabled
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-transparent text-neutral-900 placeholder:text-neutral-400 disabled:opacity-70 resize-none"
          />
        )}

        {question.type === "email" && (
          <input
            type="email"
            placeholder="name@example.com"
            disabled
            className="w-full px-4 py-3 border-b-2 border-neutral-300 focus:border-neutral-900 bg-transparent text-neutral-900 placeholder:text-neutral-400 disabled:opacity-70"
          />
        )}

        {question.type === "number" && (
          <div>
            <input
              type="number"
              placeholder="Enter a number"
              disabled
              className="w-full px-4 py-3 border-b-2 border-neutral-300 focus:border-neutral-900 bg-transparent text-neutral-900 placeholder:text-neutral-400 disabled:opacity-70"
            />
            {(question.settings_json?.min !== undefined || question.settings_json?.max !== undefined) && (
              <p className="text-sm text-neutral-500 mt-2">
                {question.settings_json?.min !== undefined && question.settings_json?.max !== undefined
                  ? `Between ${question.settings_json.min} and ${question.settings_json.max}`
                  : question.settings_json?.min !== undefined
                  ? `Minimum: ${question.settings_json.min}`
                  : `Maximum: ${question.settings_json.max}`}
              </p>
            )}
          </div>
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-4 border border-neutral-300 rounded-lg hover:border-neutral-400 cursor-pointer transition-colors"
              >
                <div className="w-5 h-5 rounded-full border-2 border-neutral-400 flex-shrink-0" />
                <span className="text-neutral-900">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === "dropdown" && (
          <select
            disabled
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 disabled:opacity-70"
          >
            <option value="">Select an option...</option>
            {question.options.map((option, index) => (
              <option key={index} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {question.type === "yes_no" && (
          <div className="flex gap-3">
            <button
              disabled
              className="flex-1 px-6 py-4 border-2 border-neutral-300 rounded-lg hover:border-neutral-900 transition-colors font-medium text-neutral-900 disabled:opacity-70"
            >
              Yes
            </button>
            <button
              disabled
              className="flex-1 px-6 py-4 border-2 border-neutral-300 rounded-lg hover:border-neutral-900 transition-colors font-medium text-neutral-900 disabled:opacity-70"
            >
              No
            </button>
          </div>
        )}

        {question.type === "rating" && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {Array.from({ length: question.settings_json?.max || 5 }, (_, i) => (
                <button
                  key={i}
                  disabled
                  className="w-12 h-12 flex items-center justify-center text-2xl hover:scale-110 transition-transform disabled:opacity-70"
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>1</span>
              <span>{question.settings_json?.max || 5}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <p className="text-sm text-neutral-400 text-center">
          Press <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">Enter</kbd> to continue
        </p>
      </div>
    </div>
  );
}
