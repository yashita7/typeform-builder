"use client";

/**
 * Draggable question list item in the builder sidebar.
 * Shows question number, type icon, and title with delete button.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question } from "@/lib/types";

interface QuestionListItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function QuestionListItem({
  question,
  index,
  isSelected,
  onClick,
  onDelete,
}: QuestionListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white border rounded-lg p-3 cursor-pointer transition-all ${
        isSelected
          ? "border-neutral-900 shadow-sm"
          : "border-neutral-200 hover:border-neutral-300"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex items-start gap-3 pl-5 pr-8">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-neutral-500">{getTypeLabel(question.type)}</span>
            {question.required && (
              <span className="text-xs text-red-600">*</span>
            )}
          </div>
          <p className="text-sm font-medium text-neutral-900 truncate">
            {question.title || "Untitled question"}
          </p>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Delete this question?")) {
            onDelete();
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
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
