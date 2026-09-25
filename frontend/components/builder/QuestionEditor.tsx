"use client";

/**
 * Question editor panel with all fields and type-specific settings.
 * Updates trigger autosave in parent component.
 */

import { useState, useEffect } from "react";
import type { Question, QuestionOption } from "@/lib/types";

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description || "");
  const [required, setRequired] = useState(question.required);
  const [settings, setSettings] = useState(question.settings_json || {});
  const [options, setOptions] = useState(question.options || []);

  // Update local state when question changes
  useEffect(() => {
    setTitle(question.title);
    setDescription(question.description || "");
    setRequired(question.required);
    setSettings(question.settings_json || {});
    setOptions(question.options || []);
  }, [question.id]);

  // Debounced autosave for text fields
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== question.title || description !== question.description) {
        onUpdate({ title, description });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, description]);

  function handleRequiredChange(value: boolean) {
    setRequired(value);
    onUpdate({ required: value });
  }

  function handleSettingsChange(newSettings: Record<string, any>) {
    setSettings(newSettings);
    onUpdate({ settings_json: newSettings });
  }

  function handleOptionsChange(newOptions: QuestionOption[]) {
    setOptions(newOptions);
    // Send the full option objects to the update handler
    // The backend expects id, question_id, label, order_index
    onUpdate({
      options: newOptions,
    });
  }

  function addOption() {
    const newOptions = [
      ...options,
      { id: Date.now(), question_id: question.id, label: `Option ${options.length + 1}`, order_index: options.length },
    ];
    handleOptionsChange(newOptions);
  }

  function updateOption(index: number, label: string) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], label };
    handleOptionsChange(newOptions);
  }

  function deleteOption(index: number) {
    if (options.length <= 1) return; // Keep at least one option
    const newOptions = options.filter((_, i) => i !== index);
    handleOptionsChange(newOptions);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="space-y-8">
        {/* Question type badge */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full">
            {getTypeLabel(question.type)}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Question title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your question"
            className="w-full px-4 py-3 text-lg border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add helpful text for respondents"
            rows={3}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors resize-none"
          />
        </div>

        {/* Required toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRequiredChange(!required)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              required ? "bg-neutral-900" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                required ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <label className="text-sm font-medium text-neutral-700">
            Required field
          </label>
        </div>

        {/* Type-specific settings */}
        {(question.type === "multiple_choice" || question.type === "dropdown") && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                  {options.length > 1 && (
                    <button
                      onClick={() => deleteOption(index)}
                      className="p-2 text-neutral-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addOption}
              className="mt-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors"
            >
              + Add option
            </button>
          </div>
        )}

        {question.type === "rating" && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Maximum rating
            </label>
            <select
              value={settings.max || 5}
              onChange={(e) =>
                handleSettingsChange({ ...settings, max: parseInt(e.target.value) })
              }
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
            >
              {[3, 4, 5, 7, 10].map((num) => (
                <option key={num} value={num}>
                  {num} stars
                </option>
              ))}
            </select>
          </div>
        )}

        {question.type === "number" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Minimum value (optional)
              </label>
              <input
                type="number"
                value={settings.min ?? ""}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    min: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No minimum"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Maximum value (optional)
              </label>
              <input
                type="number"
                value={settings.max ?? ""}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    max: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No maximum"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTypeLabel(type: Question["type"]): string {
  const labels: Record<Question["type"], string> = {
    short_text: "Short text",
    long_text: "Long text",
    multiple_choice: "Multiple choice",
    dropdown: "Dropdown",
    email: "Email",
    number: "Number",
    yes_no: "Yes/No",
    rating: "Rating",
  };
  return labels[type];
}
